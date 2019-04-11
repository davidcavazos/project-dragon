'use strict';

const ValidationError = require('../../helpers/validation-error');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(require('./schemas/tag-search-request.json'));
const model = require('./logic/tag-model');

module.exports = (req, res, next) => {

    if (!validate(req.body)) {
        throw new ValidationError(validate.errors);
    }

    let param = {
        classificationType: req.body.SearchTagRequest.classificationType,
        bounds: req.body.SearchTagRequest.bounds
    };

    return model()
        .search(param)
        .then((response) => {
            return res.status(200).send({ SearchTagResponse: response })
        })
        .catch(next);
};