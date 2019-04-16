'use strict';

const { Storage } = require('@google-cloud/storage');
const appConfig = require('./config');
const storage = new Storage(Object.assign({}, appConfig.gcp));
const Pubsub = require('@google-cloud/pubsub').PubSub;
const pdf2img = require('pdf2img');
const path = require('path');
const os = require('os');

let convert = (file) => {

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

    const fileName = filePath.split('/').pop();
    const tempFilePath = path.join(os.tmpdir(), fileName);

    return storage
        .bucket(fileBucket)
        .file(filePath)
        .download({ destination: tempFilePath })
        .then((_) => {
            let opts = {
                type: 'png',
                outputdir: path.dirname(tempFilePath),
                outputname: path.basename(tempFilePath, path.extname(tempFilePath)),
                page: 1
            };

            pdf2img.setOptions(opts);

            return new Promise((res, rej) => {
                pdf2img.convert(tempFilePath, (err, info) => {
                    if (err) {
                        rej(err);
                    } else {
                        console.log(JSON.stringify(info));
                        res(info);
                    };
                });
            })
        })
        .then((_) => {
            console.log('Successfully converted');
            const newFileName = path.basename(filePath, '.pdf') + '_1.png';
            const newDestination = `/${path.dirname(filePath)}/${newFileName}`;
            const newSource = path.join(os.tmpdir(), newFileName);
            return storage
                .bucket(fileBucket).upload(newSource, { destination: newDestination });
        })
        .catch(error => {
            console.error(error);
        });
};


const subscriptionName = appConfig.gcp.topicName;
const pubsub = new Pubsub({ projectId: appConfig.gcp.projectId });
const subscription = pubsub.subscription(subscriptionName);

const messageHandler = message => {
    console.log(`Received message ${message.id}:`);
    let data = message.data.toString();
    console.log(`Data: ${data}`);

    convert(JSON.parse(data))
        .then(() => {
            message.ack();
        })
};

subscription.on(`message`, messageHandler);

