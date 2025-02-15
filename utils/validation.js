const httpError = require("../helpers/httpError");

const { schemas } = require("../models/contacts");

const { authSchemas } = require("../models/user");

function validateAddContact(req, res, next) {
    const {error} = schemas.addSchema.validate(req.body);
    if(error) {
    throw httpError.HttpError(400, error.message);
}
    next();
}

function validatePutContact(req, res, next) {
    const {error} = schemas.putSchema.validate(req.body);
    if(error) {
    throw httpError.HttpError(400, error.message);
}
    next(); 
}

function validatePatchContact(req, res, next) {
    const {error} = schemas.updateFavoriteSchema.validate(req.body);
    if(error) {
    throw httpError.HttpError(400, error.message);
}
    next(); 
}

function validateRegistration(req, res, next) {
    const {error} = authSchemas.registerSchema.validate(req.body);
    if(error) {
    throw httpError.HttpError(400, error.message);
}
    next(); 
}

function validateLogin(req, res, next) {
    const {error} = authSchemas.loginSchema.validate(req.body);
    if(error) {
    throw httpError.HttpError(400, error.message);
}
    next(); 
}

function validateSubscription(req, res, next) {
    const {error} = authSchemas.subscriptionSchema.validate(req.body);
    if(error) {
    throw httpError.HttpError(400, error.message);
}
    next(); 
}

function validateEmail(req, res, next) {
    const {error} = authSchemas.emailSchema.validate(req.body);
    if(error) {
    throw httpError.HttpError(400, error.message);
}
    next(); 
}

module.exports = {
    validateAddContact,
    validatePutContact,
    validatePatchContact,
    validateRegistration,
    validateLogin,
    validateSubscription,
    validateEmail,
}
