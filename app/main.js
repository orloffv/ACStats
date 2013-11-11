(function () {
    "use strict";
    module.exports = function(mongoose) {
        var express = require('express');
        var config = require('./libs/config');
        var log = require('./libs/log')(module, config);

        mongoose = require('./libs/mongoose')(mongoose, log, config);

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

        require('./routes/event')(app, mongoose, log);
        require('./routes/index')(app, mongoose, log);

        app.set('mongoose', mongoose);

        return app;
    };
})();
