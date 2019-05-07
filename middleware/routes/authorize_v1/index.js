'use strict'

const routes = require('express').Router({ mergeParams: true });

module.exports = () => {
    routes.post('/', require('./post'));
    return routes;
}