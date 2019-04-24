'use strict';

const { Datastore } = require('@google-cloud/datastore');
const appConfig = require('../../../config');

let tagModel = () => {

    const kind = 'tagged-doc';
    const datastore = new Datastore({
        projectId: appConfig.gcp.projectId
    });

    this.get = (input) => {
        const { orderByColumn, orderby, nextPageCursor, pageSize } = input;
        const query = datastore.createQuery(kind);

        if (orderByColumn) {
            query.order(orderByColumn || 'name', { descending: orderby && orderby.toLowerCase() === 'descending' });
        }

        if (pageSize) {
            query.limit(pageSize);
        }

        if (nextPageCursor) {
            query.start(nextPageCursor);
        }

        return datastore.runQuery(query)
            .then((result) => {
                let response = {
                    data: result[0]
                };
                if (result[1].moreResults !== datastore.NO_MORE_RESULTS) {
                    response.nextPageCursor = result[1].endCursor;
                }
                return response;
            });
    }

    this.create = (input) => {
        const id = new Date().getTime().toString();
        const entry = {
            key: datastore.key([kind, id]),
            data: input,
        };
        return datastore.save(entry);
    }

    this.delete = (key) => {
        const _key = datastore.key([kind, key])
        return datastore.delete(_key);
    }

    return this;
}

module.exports = tagModel;