'use strict';

const appConfig = require('./config/config.json');
const Pubsub = require('@google-cloud/pubsub').PubSub;

/**
 * Triggered from a change to a Cloud Storage bucket.
 *
 * @param {!Object} event Event payload and metadata.
 * @param {!Function} callback Callback function to signal completion.
 */
exports.convert = (event, callback) => {
    const file = event;

    const fileBucket = file.bucket;
    const filePath = file.name;
    const contentType = file.contentType;
    /* The resourceState is 'exists' or 'not_exists' (for file/folder deletions).*/
    const resourceState = file.resourceState;

    if (!contentType.startsWith('application/pdf')) {
        console.log(`${fileBucket}/${filePath} is not a pdf file.`);
        return;
    }

    if (resourceState && resourceState === 'not_exists') {
        console.log('Existing as this is a deletion event.');
        return;
    }

    const topicName = appConfig.gcp.topicName;
    const pubsub = new Pubsub({ projectId: appConfig.gcp.projectId });

    return pubsub.topic(topicName).publish(Buffer.from(JSON.stringify(file)))
        .catch(error => {
            console.error(error);
        });
};