'use strict';

const model = require('./logic/tag-model');
const sourcesModel = require('../sources_v1/logic/sources-model');
const gcpAPIHelper = require('../train_v1/logic/gcs-api-helper')();
const Promise = require('bluebird');

module.exports = (req, res, next) => {

    let param = {
        orderByColumn: req.query.orderbycolumn,
        orderby: req.query.orderby,
        nextPageCursor: req.query.nextpagecursor,
        pageSize: req.query.pagesize
    }

    return Promise.all([
        model()
            .get(param),
        getValidFileNames(param)
    ])
        .then(([tags, sources]) => {
            let paths = sources.map((s) => s.path);
            let response = {
                data: tags.data.filter((t => paths.indexOf(t.documentPath) > -1))
            }
            return res.status(200).send({ GetTagDocResponse: response })
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