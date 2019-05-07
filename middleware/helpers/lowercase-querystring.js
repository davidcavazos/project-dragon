'use strict';

module.exports = lowercaseQuerystring;

/**
 * Lower case query string
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function lowercaseQuerystring(req, res, next) {
    if (req.query) {
        for (let key in req.query) {
            let lowercaseKey = key.toLowerCase();
            if (key !== lowercaseKey) {
                if (!req.query[lowercaseKey]) {
                    req.query[lowercaseKey] = req.query[key];
                }
                delete req.query[key];
            }
        }
    }

    next();
}
