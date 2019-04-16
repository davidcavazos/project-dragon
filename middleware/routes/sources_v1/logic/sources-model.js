'use strict';

const { Datastore } = require('@google-cloud/datastore');
const appConfig = require('../../../config');

let sourceModel = () => {

    const NUM_RESULTS_PER_PAGE = 15;
    const kind = 'sources';
    const datastore = new Datastore({
        projectId: appConfig.gcp.projectId
    });

    this.get = (input) => {
        const { orderByColumn, orderby, nextPageCursor } = input;
        const query = datastore.createQuery(kind)
            .order(orderByColumn || 'name', { descending: orderby && orderby.toLowerCase() === 'descending' })
            .limit(NUM_RESULTS_PER_PAGE);

        if (nextPageCursor) {
            query.start(nextPageCursor);
        }

        return datastore.runQuery(query)
            .then((result) => {
                let response = {
                    data: result[0].map(r => {
                        return Object.assign({}, r, { id: r[datastore.KEY].name })
                    })
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
            data: {
                name: input.name,
                type: input.type,
                extension: input.extension,
                size: input.size,
                path: input.path,
                created_by: input.created_by || 'system',
                created_date: input.created_date || new Date().toISOString(),
                vision_api_result: input.vision_api_result || '',
                vision_api_correct_result: input.vision_api_correct_result || '',
            },
        };
        return datastore.save(entry);
    }

    this.delete = (key) => {
        const _key = datastore.key([kind, key])
        return datastore.delete(_key);
    }

    return this;
}

module.exports = sourceModel;