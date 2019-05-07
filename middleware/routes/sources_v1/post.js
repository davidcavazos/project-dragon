'use strict';

const ValidationError = require('../../helpers/validation-error');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(require('./schemas/scource-create-request.json'));
const model = require('./logic/sources-model');

module.exports = (req, res, next) => {

    if (!validate(req.body)) {
        throw new ValidationError(validate.errors);
    }

    let params = {
        name: req.body.CreateSourceRequest.name,
        type: req.body.CreateSourceRequest.type,
        extension: req.body.CreateSourceRequest.extension,
        size: req.body.CreateSourceRequest.size,
        path: req.body.CreateSourceRequest.path
    };
    return model()
        .create(params)
        .then(result => res.status(200).send({ CreateSourceResponse: result }))
        .catch(next);
};