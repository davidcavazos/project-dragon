'use strict';

const { Storage } = require('@google-cloud/storage');
const appConfig = require('../../../config');
const storage = new Storage(Object.assign({}, appConfig.gcp));
const whitelisted = ['.jpg', '.jpeg', '.jfif', '.tiff', '.png', '.tif', '.gif'];

module.exports = () => {

    this.listFiles = (folder) => {
        let parts = folder.split('/');
        let bucketName = parts.shift();
        let basePath = `${parts.filter(x => x).join('/')}/`;
        let options = parts.length > 0 ? { prefix: basePath, delimiter: '/' } : {};
        return storage.bucket(bucketName).getFiles(options)
            .then(([result]) => {
                return result.filter((r) => whitelisted.some((ex) => r.name.toLowerCase().endsWith(ex))).map((r) => {
                    return { bucketName: bucketName, srcFilename: r.name, path: `gs://${bucketName}/${r.name}` };
                });
            })
            .catch((err) => {
                return [];
            })
    }

    this.downloadFile = (source) => {
        return storage
            .bucket(source.bucketName)
            .file(source.srcFilename)
            .download({})
            .then(([result]) => {
                return result;
            });
    }

    this.uploadFile = (source, content, format) => {
        return storage
            .bucket(source.bucketName)
            .file(source.srcFilename)
            .save(content, {
                metadata: { contentType: `image/${format}` }
            });
    }

    return this;
}