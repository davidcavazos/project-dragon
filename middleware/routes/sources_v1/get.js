'use strict';

const model = require('./logic/sources-model');

module.exports = (req, res, next) => {

    let param = {
        orderByColumn: req.query.orderbycolumn,
        orderby: req.query.orderby,
        nextPageCursor: req.query.nextpagecursor
    }
    return model()
        .get(param)
        .then(result => res.status(200).send({ GetSourcesResponse: result }))
        .catch(next);
};