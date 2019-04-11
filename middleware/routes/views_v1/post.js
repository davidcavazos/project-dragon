'use strict';

const ValidationError = require('../../helpers/validation-error');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(require('./schemas/view-create-request.json'));
const model = require('./logic/view-model');
const Promise = require('bluebird');

module.exports = (req, res, next) => {

    if (!validate(req.body)) {
        throw new ValidationError(validate.errors);
    }

    let params = req.body.CreateViewRequest.map((r) => {
        return {
            viewname: r.viewname,
            key: r.key,
            operator: r.operator,
            value: r.value
        };
    });

    return Promise.resolve(model())
        .then((m) => Promise.each(params, (p) => m.create(p)))
        .then(result => res.status(200).send({ CreateViewResponse: result }))
        .catch(next);
};