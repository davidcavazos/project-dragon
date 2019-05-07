'use strict'

/**
 * Sample Values
 * "secret": "e32bd326eae57036be5c17f1bd6b9bd36b7e5b8e"
 * "projectId": "project-dragon-2019"
 * "computeRegion": "us-central1"
 * "modelId": "ICN3914447273581097112"
 * "topicName": "pdf-converter"
 */
module.exports = {
    "secret": process.env.JWT_SECRET,
    "gcp": {
        "projectId": process.env.PROJECT_ID,
        "computeRegion": process.env.COMPUTE_REGION,
        "modelId": process.env.MODEL_ID,
        "topicName": process.env.TOPIC_NAME
    }
}