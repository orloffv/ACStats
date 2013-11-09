(function () {
    "use strict";
    var express = require('express');
    var routes = require('./routes');
    var routesEvent = require('./routes/event');
    var log = require('./libs/log')(module);
    var config = require('./libs/config');
    var mongoose = require('./libs/mongoose');

    var allowCrossDomain = function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        next();
    };

    var app = express();

    // all environments
    app.set('port', config.get('port'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(allowCrossDomain);
    app.use(app.router);

    app.use(function(req, res, next){
        res.status(404);
        log.debug('Not found URL: %s', req.url);
        res.send({ error: 'Not found' });

        return;
    });

    app.use(function(err, req, res, next){
        res.status(err.status || 500);
        log.error('Internal error(%d): %s', res.statusCode, err.message);
        res.send({ error: err.message });

        return;
    });

    app.get('/', routes.index);

    app.get('/api/events', routesEvent.list);
    app.post('/api/events', routesEvent.post);
    app.get('/api/events/:id', routesEvent.get);
    app.put('/api/events/:id', routesEvent.put);
    app.delete('/api/events/:id', routesEvent.delete);

    app.set('mongoose', mongoose);
    module.exports = app;
})();
