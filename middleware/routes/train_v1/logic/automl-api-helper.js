'use strict';

const automl = require('@google-cloud/automl').v1beta1;
const appConfig = require('../../../config/config.json');
const client = new automl.PredictionServiceClient(Object.assign({}, appConfig.gcp));
const modelFullId = client.modelPath(appConfig.gcp.projectId, appConfig.gcp.computeRegion, appConfig.gcp.modelId);

let automlApiHelper = () => {

    this.predict = (content) => {
        let params = {};
        let payload = {
            image: {
                imageBytes: content
            }
        }
        return client.predict({
            name: modelFullId,
            payload: payload,
            params: params
        })
            .then(([result]) => result);
    }
    return this;
}

module.exports = automlApiHelper;