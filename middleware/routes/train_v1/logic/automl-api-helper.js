'use strict';

const automl = require('@google-cloud/automl').v1beta1;
const appConfig = require('../../../config');

let automlApiHelper = () => {

    this.latestModel = () => {
        const client = new automl.AutoMlClient(Object.assign({}, appConfig.gcp));
        return client.listModels({ parent: client.locationPath(appConfig.gcp.projectId, appConfig.gcp.computeRegion) })
            .then(responses => {
                const latestModel = (responses[0] || []).filter(m => m.deploymentState === 'DEPLOYED')[0];
                const modelName = latestModel.name.split('/').pop();
                return modelName;
            });
    }

    this.predict = (content) => {
        return this.latestModel()
            .then((modelId) => {
                const client = new automl.PredictionServiceClient(Object.assign({}, appConfig.gcp));
                const params = {};
                const payload = {
                    image: {
                        imageBytes: content
                    }
                }
                return client.predict({
                    name: client.modelPath(appConfig.gcp.projectId, appConfig.gcp.computeRegion, modelId),
                    payload: payload,
                    params: params
                })
                    .then(([result]) => {
                        return result;
                    });
            })

    }
    return this;
}

module.exports = automlApiHelper;