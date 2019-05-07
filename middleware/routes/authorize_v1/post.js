'use strict';

const ValidationError = require('../../helpers/validation-error');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(require('./schemas/login-request.json'));
const authorize = require('./logic/authorize');

module.exports = (req, res, next) => {

    if (!validate(req.body)) {
        throw new ValidationError(validate.errors);
    }

    let params = {
        username: req.body.LoginRequest.username,
        password: req.body.LoginRequest.password
    };
    return authorize(params)
        .then(result => res.status(200).send(result))
        .catch(next);
};