'use strict'

const routes = require('express').Router({ mergeParams: true });

module.exports = () => {
    routes.use('/authorize', require('./authorize_v1')());
    routes.use('/vision', require('./train_v1')());
    routes.use('/view', require('./views_v1')());
    routes.use('/source', require('./sources_v1')());
    routes.use('/tag', require('./tag_v1')());
    routes.use('/image', require('./image_v1')());
    return routes;
};