'use strict';

const appConfig = require('../../../config/config.json');
const vision = require('@google-cloud/vision');
const sharp = require('sharp');
const gcpAPIHelper = require('./gcs-api-helper')();

let visionApiHelper = () => {
    this.performOcr = (source, content) => {
        const client = new vision.ImageAnnotatorClient(Object.assign({}, appConfig.gcp));

        return reSizeImage(source, content)
            .then(() => client.textDetection(source.path))
            .then(([result]) => {
                if (!result) {
                    return Promise.reject(`Empty respose for file ${source.path}.`);
                }
                return { textAnnotations: result.textAnnotations, fullTextAnnotation: result.fullTextAnnotation };
            });
    }
    return this;
}

let reSizeImage = (source, content) => {
    return Promise.resolve(sharp(content))
        .then((_sharpe) => {
            return _sharpe.metadata()
                .then(info => {
                    if (info.height === 480 && info.width === 371) {
                        return Promise.resolve(true);
                    }
                    return Promise.resolve(_sharpe.resize(371, 480, { fit: 'contain' }).toBuffer())
                        .then((reshapedImage) => gcpAPIHelper.uploadFile(source, reshapedImage, info.format))
                });
        })
}

module.exports = visionApiHelper;