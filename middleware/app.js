/* eslint-disable no-console */
'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const lowercaseQuerystring = require('./helpers/lowercase-querystring');
const apiErrorHandler = require('./helpers/error-handler');
const jwt = require('./helpers/jwt');
const path = require('path');

if (process.env.NODE_ENV !== 'production') {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, './keys/project-dragon.json');
}

const port = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('json replacer', (key, value) => { return (value == null) ? undefined : value });
app.use(lowercaseQuerystring);
app.use(express.static('public'));

// JWT auth to secure the api
app.use(jwt());

// register routes
app.use('/api/v1/', routes());

// Basic 404 handler
app.use((req, res) => {
    res.status(404).send('Not Found');
});

// error handler
app.use(apiErrorHandler({ detailed: process.env.NODE_ENV !== 'production' }));

if (module === require.main) {
    const server = app.listen(port, () => {
        const port = server.address().port;
        console.log(`App listening on port ${port}`);
    });
}