'use strict';

const model = require('./logic/sources-model');

module.exports = (req, res, next) => {

    return model()
        .delete(req.params.id)
        .then(result => res.status(200).send({ DeleteSourceResponse: result }))
        .catch(next);
};