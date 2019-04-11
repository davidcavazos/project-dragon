'use strict'

const routes = require('express').Router({ mergeParams: true });

module.exports = () => {
    routes.get('/', require('./get'));
    routes.post('/', require('./post'));
    routes.delete('/:id', require('./delete'));
    return routes;
}