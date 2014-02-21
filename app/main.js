(function () {
    "use strict";
    module.exports = function(mongoose, environment) {
        var express = require('express');
        var config = require('./libs/config')(environment);
        var log = require('./libs/log')(module, config);
        var async = require('async');
        var useragent = require('express-useragent');
        var errorHelper = require('./libs/error-helper')(log);

        mongoose = require('./libs/mongoose')(mongoose, log, config);

        var allowCrossDomain = function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
            res.header("Access-Control-Allow-Headers", "origin, content-type, accept, x-mime-type, x-requested-with, x-file-name, pragma, cache-control");

            next();
        };

        var app = express();

        app.configure('development', function() {
        });

        app.configure('production', function(){
        });

        app.configure('testing', function(){
        });

        // all environments
        app.set('case sensitive routes', false);
        app.set('strict routing', false);
        app.set('log', log);
        app.use(useragent.express());
        app.use(express.json());
        app.use(express.urlencoded());
        app.use(express.methodOverride());
        app.use(allowCrossDomain);

        app.use(app.router);

        app.use(function(req, res, next) {
            res.status(404);
            log.debug('Not found URL: %s', req.url);

            return res.send({ error: 'Not found' });
        });

        app.use(function(err, req, res, next) {
            return errorHelper(err, res);
        });

        require('./routes/event')(app, mongoose, log);
        require('./routes/hit')(app, mongoose, log);
        require('./routes/server')(app, mongoose, log);
        require('./routes/user')(app, mongoose, log);
        require('./routes/session')(app, mongoose, log);
        require('./routes/all')(app, mongoose, log);
        require('./routes/statistic')(app, mongoose, log);
        require('./routes/index')(app, mongoose, log);

        app.set('mongoose', mongoose);
        app.set('config', config);

        app.set('closeApplication', function(app) {
            app.get('log').debug('Application: closing');
            var closeServers = function(callback) {
                async.parallel(
                    [
                        function(cb) {
                            if (app.get('httpInstance')) {
                                app.get('log').debug('HTTP server: closing');
                                try {
                                    app.get('httpInstance').close(function(cbc) {
                                        app.get('log').debug('HTTP server: closed');
                                        cb(cbc);
                                    });
                                } catch(e) {
                                    cb();
                                }
                            } else {
                                cb();
                            }
                        },
                        function(cb) {
                            if (app.get('httpsInstance')) {
                                app.get('log').debug('HTTPS server: closing');
                                try {
                                    app.get('httpsInstance').close(function(cbc) {
                                        app.get('log').debug('HTTPS server: closed');
                                        cb(cbc);
                                    });
                                } catch(e) {
                                    cb();
                                }
                            } else {
                                cb();
                            }
                        },
                        function(cb) {
                            app.get('mongoose').disconnectServer(cb);
                        }
                    ],
                    callback
                );
            };

            closeServers(function() {
                process.exit(0);
            });

            setTimeout(function() {
                app.get('log').debug('Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 5*1000);
        });

        //process.on('exit', function() {
        //    app.get('closeApplication')(app);
        //});

        process.on('message', function(msg) {
            if (msg === 'shutdown') {
                //app.get('closeApplication')(app);
            }
        });

        process.on('SIGINT', function() {
            app.get('closeApplication')(app);
        });

        process.on('SIGTERM', function() {
            app.get('closeApplication')(app);
        });

        process.on('SIGTSTP', function() {
            app.get('closeApplication')(app);
        });

        process.on('uncaughtException', function(err) {
            app.get('log').error('Internal error: %s', err.message, err);
        });

        return app;
    };
})();
