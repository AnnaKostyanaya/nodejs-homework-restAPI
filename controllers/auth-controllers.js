const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const fs = require("fs/promises");
const path = require("path");
const Jimp = require('jimp');
const { nanoid } = require("nanoid");

const { ctrlWrapper } = require("../utils");
const { User } = require("../models/user");
const error = require("../helpers/httpError");
const sendEmail = require("../helpers/sendEmail");

const {SECRET_KEY, BASE_URL} = process.env;
const avatarDir = path.join(__dirname, "../", "public/avatars");

const register = async(req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(user) {
        throw error.HttpError(409, "Email in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const verificationToken = nanoid();

    const result = await User.create({...req.body, password: hashPassword, avatarURL, verificationToken});

    const verifyEmail = {
        to: email,
        subject: "Verify your email",
        html: `<a target="_blank" href="${BASE_URL}/users/verify/${verificationToken}">Click to verify email</a>`
    }
    await sendEmail(verifyEmail);

    res.status(201).json({
        "user": {
        "email": result.email,
        "subscription": result.subscription,
    }
    })
}
const verify = async(req, res) => {
    const {verificationToken} = req.params;
    const user = await User.findOne({verificationToken});
    if(!user) {
        throw error.HttpError(404, "User not found");
    }
    await User.findByIdAndUpdate(user._id, {verify: true, verificationToken: null})
    res.status(200).json({
        message: "Verification successful" 
    })
}

const resendVerifyEmail  = async(req, res) => {
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!email) {
        throw error.HttpError(400, "missing required field email");
    }
    if(!user) {
        throw error.HttpError(404, "User not found");
    }
    if(user.verify) {
        throw error.HttpError(400, "Verification has already been passed");
    }
    const verifyEmail = {
        to: email,
        subject: "Verify your email",
        html: `<a target="_blank" href="${BASE_URL}/users/verify/${user.verificationToken}">Click to verify email</a>`
    }
    await sendEmail(verifyEmail);

    res.status(200).json({
        message: "Verification email sent"
    })
    
}

const login = async(req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user) {
        throw error.HttpError(401, "Email or password is wrong");
    }
    if(!user.verify) {
        throw error.HttpError(401, "Email not verify");
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if(!passwordCompare) {
        throw error.HttpError(401, "Email or password is wrong");
    }

    const payload = {
        id: user._id,
    }
    
    const token = jwt.sign(payload, SECRET_KEY, {expiresIn: "72h"});
    await User.findByIdAndUpdate(user._id, {token});

    res.status(200).json({
        "token": token,
        "user": {
            "email": user.email,
            "subscription": user.subscription,
        }
    })
}

const getCurrent = async(req, res) => {
    const {name, email} = req.user;

    res.status(200).json({
        name,
        email
    })
}

const logout = async(req, res) => {
    const {_id} = req.user;
    await User.findByIdAndUpdate(_id, {token: ""});
    res.status(204).json({
        message: "No content"
    })

}

const updateSubscription = async (req, res) => {
    const {_id} = req.user;
    console.log(_id);
    const result = await User.findByIdAndUpdate(_id, req.body, {new: true});
    if (!result) {
        throw error.HttpError(404, `Not found`);
    }
    res.status(200).json({
        "user": {
            "email": result.email,
            "subscription": result.subscription,
        }
    });
}


const updateAvatar = async (req, res) => {
    const {_id} = req.user;
    const {path: tempUpload, filename} = req.file;
    const avatarName = `${_id}_${filename}`;
    const resultUpload = path.join(avatarDir, avatarName);

    // await fs.rename(tempUpload, resultUpload);
    // Зміна імені та розміру
    const image = await Jimp.read(tempUpload);
    await image.resize(250, 250).write(resultUpload);

    // Видалення старого файлу
    await fs.unlink(tempUpload);

    const avatarURL = path.join("avatars", avatarName);
    await User.findByIdAndUpdate(_id, {avatarURL});

    res.status(200).json({avatarURL});
};

module.exports = {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    updateSubscription: ctrlWrapper(updateSubscription),
    updateAvatar: ctrlWrapper(updateAvatar),
    verify: ctrlWrapper(verify),
    resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
}