'use strict'

const routes = require('express').Router({ mergeParams: true });

module.exports = () => {
    routes.get('/', require('./get'));
    return routes;
}