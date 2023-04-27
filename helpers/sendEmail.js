const nodemailer = require("nodemailer");
require("dotenv").config();

const {EMAIL_FROM, META_PASSWORD} = process.env;

const nodemailerConfig = {
    host: "smtp.meta.ua",
    port: 465, // 25, 465, 2525
    secure: true,
    auth: {
        user: EMAIL_FROM,
        pass: META_PASSWORD,
    },
    tls: { rejectUnauthorized: false },
};

const transport = nodemailer.createTransport(nodemailerConfig);

const sendEmail = async(data) => {
    const email = {...data, from: EMAIL_FROM};
    await transport.sendMail(email);
    return true;
}

module.exports = sendEmail;