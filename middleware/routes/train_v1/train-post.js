'use strict';

const ValidationError = require('../../helpers/validation-error');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(require('./schemas/train-request.json'));
const processTraining = require('./logic/train-model');

module.exports = (req, res, next) => {

    if (!validate(req.body)) {
        throw new ValidationError(validate.errors);
    }

    let params = req.body.TrainModelRequest;

    return processTraining(req.context, params)
        .then(result => {
            let response = {
                TrainModelResponse: { messageId: result }
            };
            return res.status(200).send(response);
        })
        .catch(next);
};