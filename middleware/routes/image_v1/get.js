'use strict';

const ValidationError = require('../../helpers/validation-error');
const gcpAPIHelper = require('../train_v1/logic/gcs-api-helper')();

module.exports = (req, res, next) => {

    if (!req.query.bucketname) {
        throw new ValidationError("Required parameter bucket name is missing!");
    }
    if (!req.query.srcfilename) {
        throw new ValidationError("Required parameter source file name is missing!");
    }
    let params = {
        bucketName: req.query.bucketname,
        srcFilename: req.query.srcfilename
    }
    return gcpAPIHelper.downloadFile(params)
        .then(result => res.status(200).send({ GetImageResponse: `data:image/png;base64, ${result.toString('base64')}` }))
        .catch(next);
};