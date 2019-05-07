'use strict';

const Promise = require('bluebird');
const visionAPIHelper = require('./vision-api-helper')();
const autoMLAPIHelper = require('./automl-api-helper')();
const gcpAPIHelper = require('./gcs-api-helper')();

module.exports = (context, params) => {

    return Promise.map(params.Sources, (s) => gcpAPIHelper.listFiles(s), { concurrency: 3 })
        .then((_sources) => {
            let _soc = [].concat.apply([], _sources);
            return Promise.map(_soc, (source) => {

                return gcpAPIHelper.downloadFile(source)
                    .then((content) => {
                        return Promise.all([
                            autoMLAPIHelper.predict(content),
                            visionAPIHelper.performOcr(source, content)
                        ])
                    })
                    .then(([automlAPIResult, visionAPIResult]) => {
                        return {
                            source: source,
                            autoMLAPIResponse: automlAPIResult,
                            visionAPIResponse: visionAPIResult
                        }
                    })
            }, { concurrency: 3 });
        })
        .then((result) => {
            return {
                PredictionResult: result
            };
        })
}
