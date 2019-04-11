'use strict'

const routes = require('express').Router({ mergeParams: true });

module.exports = () => {
    routes.get('/', require('./get'));
    routes.post('/', require('./post'));
    routes.post('/delete', require('./delete'));
    return routes;
}