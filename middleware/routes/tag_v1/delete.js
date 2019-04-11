'use strict';

const ValidationError = require('../../helpers/validation-error');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(require('./schemas/tag-delete-request.json'));
const model = require('./logic/tag-model');
const Promise = require('bluebird');

module.exports = (req, res, next) => {

    if (!validate(req.body)) {
        throw new ValidationError(validate.errors);
    }

    return Promise.resolve(model())
        .then((m) => Promise.each(req.body.DeleteTagRequest, (p) => m.delete(p)))
        .then(result => res.status(200).send({ DeleteTagResponse: result }))
        .catch(next);
};