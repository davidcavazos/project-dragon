'use strict';


const { Datastore } = require('@google-cloud/datastore');
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const appConfig = require('../../../config');

module.exports = (params) => {
    return findUser(params)
        .then((user) => {
            if (user && user.length > 0) {
                let token = jwt.sign({ data: params, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 60) }, appConfig.secret);
                return {
                    LoginResponse: {
                        status: "success",
                        token: token
                    }
                }
            }
            return {
                LoginResponse: {
                    "status": "Invalid username or password"
                }
            }
        });
}

let findUser = (input) => {
    const kind = 'users';
    const datastore = new Datastore({
        projectId: appConfig.gcp.projectId
    });
    const { username, password } = input;
    const query = datastore.createQuery(kind).filter('username', username).filter('password', md5(password));
    return datastore.runQuery(query)
        .then((result) => {
            return result[0];
        })
}
