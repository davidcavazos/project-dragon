'use strict';

const Pubsub = require('@google-cloud/pubsub').PubSub;
const appConfig = require('../../../config');
const uuidv1 = require('uuid/v1')

module.exports = (context, param) => {

    const topicName = appConfig.gcp.topicName;
    const pubsub = new Pubsub({ projectId: appConfig.gcp.projectId });
    const dataBuffer = Buffer.from(JSON.stringify({ train_budget: param.TrainingTime, session_id: uuidv1() }));

    return pubsub.topic(topicName).publish(dataBuffer);
}