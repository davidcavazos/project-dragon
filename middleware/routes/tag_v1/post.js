'use strict';

const ValidationError = require('../../helpers/validation-error');
const Promise = require('bluebird');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(require('./schemas/tag-create-request.json'));
const model = require('./logic/tag-model');

module.exports = (req, res, next) => {

    if (!validate(req.body)) {
        throw new ValidationError(validate.errors);
    }

    let params = req.body.CreateTagRequest.map((r) => {
        return {
            documentPath: r.documentPath,
            classificationType: r.classificationType,
            classificationScore: r.classificationScore,
            columnName: r.columnName,
            columnValue: r.columnValue,
            xCoordinate: r.xCoordinate,
            width: r.width,
            yCoordinate: r.yCoordinate,
            height: r.height,
            createdBy: r.createdBy || 'system',
            createdDate: r.createdDate || new Date().toISOString(),
            updatedBy: r.updatedBy || 'system',
            updatedDate: r.updatedDate || new Date().toTimeString()
        };
    });

    return Promise.resolve(model())
        .then((m) => Promise.each(params, (p) => m.create(p)))
        .then(result => res.status(200).send({ CreateTagDocRequest: result }))
        .catch(next);
};