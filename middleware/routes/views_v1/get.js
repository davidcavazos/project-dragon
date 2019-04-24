'use strict';

const model = require('./logic/view-model');

module.exports = (req, res, next) => {

    let param = {
        orderByColumn: req.query.orderbycolumn,
        orderby: req.query.orderby,
        nextPageCursor: req.query.nextpagecursor,
        pageSize: req.query.pagesize
    }
    return model()
        .get(param)
        .then(result => res.status(200).send({ GetViewResponse: formatResponse(result.data) }))
        .catch(next);
};

const formatResponse = (input) => {
    let result = groupBy(input, 'viewname');
    let response = [];
    for (const key in result) {
        if (result.hasOwnProperty(key)) {
            response.push({
                name: key,
                fitlers: result[key]
            });
        }
    }
    return response;
}

const groupBy = (xs, key) => {
    return xs.reduce((rv, x) => {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};