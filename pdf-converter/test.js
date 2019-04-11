'use strict';

const conveter = require('./pdf-to-image');


let event = {
    "bucket": "docex",
    "contentType": "application/pdf",
    "crc32c": "XBc/yQ==",
    "etag": "CLaPiMXMseECEAE=",
    "generation": "1554214591530934",
    "id": "docex/demo/hr-outsourcing.pdf/1554214591530934",
    "kind": "storage#object",
    "md5Hash": "AUzr4ZHnrRZCjhCDgfoJPg==",
    "mediaLink": "https://www.googleapis.com/download/storage/v1/b/docex/o/demo%2Fhr-outsourcing.pdf?generation=1554214591530934&alt=media",
    "metageneration": "1",
    "name": "demo/hr-outsourcing.pdf",
    "selfLink": "https://www.googleapis.com/storage/v1/b/docex/o/demo%2Fhr-outsourcing.pdf",
    "size": "167162",
    "storageClass": "MULTI_REGIONAL",
    "timeCreated": "2019-04-02T14:16:31.530Z",
    "timeStorageClassUpdated": "2019-04-02T14:16:31.530Z",
    "updated": "2019-04-02T14:16:31.530Z"
};

conveter(event);