'use strict';

const model = require('./logic/sources-model');

module.exports = (req, res, next) => {

    let param = {
        orderByColumn: req.query.orderbycolumn,
        orderby: req.query.orderby,
        nextPageCursor: req.query.nextpagecursor,
        pageSize: req.query.pagesize
    }
    return model()
        .get(param)
        .then(result => res.status(200).send({ GetSourcesResponse: result }))
        .catch(next);
};