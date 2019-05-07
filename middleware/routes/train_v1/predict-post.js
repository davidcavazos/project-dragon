'use strict';

const ValidationError = require('../../helpers/validation-error');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(require('./schemas/predict-request.json'));
const processPrediction = require('./logic');

module.exports = (req, res, next) => {

    if (!validate(req.body)) {
        throw new ValidationError(validate.errors);
    }
    const params = req.body.PredictRequest;
    return processPrediction(req.context, params)
        .then(result => res.status(200).send(result))
        .catch(next);
};