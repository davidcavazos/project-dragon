'use strict';

const ValidationError = require('../../helpers/validation-error');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(require('./schemas/tag-search-request.json'));
const model = require('./logic/tag-model');
const sourcesModel = require('../sources_v1/logic/sources-model');
const gcpAPIHelper = require('../train_v1/logic/gcs-api-helper')();
const Promise = require('bluebird');

module.exports = (req, res, next) => {

    if (!validate(req.body)) {
        throw new ValidationError(validate.errors);
    }

    let param = {
        classificationType: req.body.SearchTagRequest.classificationType,
        bounds: req.body.SearchTagRequest.bounds
    };

    return Promise.all([
        model()
            .search(param),
        getValidFileNames(param)
    ])
        .then(([tags, sources]) => {
            let paths = sources.map((s) => s.path);
            let data = tags.filter((t => paths.indexOf(t.documentPath) > -1)) || [];

            let response = param.bounds.map((b) => {
                let { x, y } = b;
                let exist = data.filter((r) => {
                    return y >= r.yCoordinate && y <= (r.yCoordinate + (r.height + (r.height * 0.1))) && x >= r.xCoordinate && x <= (r.xCoordinate + (r.width + (r.width * 0.1)))
                })[0];
                if (exist) {
                    return Object.assign({}, b, { color: 'limegreen', columnName: exist.columnName });
                }
                return Object.assign({}, b, { color: 'red' });
            })
            return res.status(200).send({ SearchTagResponse: response })
        })
        .catch(next);
};


let getValidFileNames = (param) => {

    return sourcesModel().get(param)
        .then((sources) => {
            let paths = sources.data.map((d => d.path));
            return Promise.map(paths, (s) => gcpAPIHelper.listFiles(s.replace('gs://', '')));
        })
        .then((_sources) => {
            return [].concat.apply([], _sources);
        });
}