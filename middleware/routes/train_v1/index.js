'use strict'

const routes = require('express').Router({ mergeParams: true });

module.exports = () => {
    routes.post('/train', require('./train-post'));
    routes.post('/predict', require('./predict-post'));
    return routes;
}