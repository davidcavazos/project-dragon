'use strict';

const expressJwt = require('express-jwt');
const config = require('../config');

module.exports = () => {
    const { secret } = config;
    return expressJwt({ secret }).unless({
        path: [
            '/api/v1/authorize',
            '/api/v1/authorize/'
        ]
    });
}