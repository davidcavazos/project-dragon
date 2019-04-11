'use strict'

const routes = require('express').Router({ mergeParams: true });

module.exports = () => {
    routes.get('/', require('./get'));
    routes.post('/search', require('./search'));
    routes.post('/', require('./post'));
    routes.put('/', require('./put'));
    routes.post('/delete', require('./delete'));
    return routes;
}