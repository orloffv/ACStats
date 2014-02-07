(function () {
    "use strict";
    module.exports = function(app, mongoose, log) {
        var _          = require('underscore');

        var SessionProvider = require('../data-provider/session')(mongoose, log);
        var errorHelper = require('mongoose-error-helper').errorHelper;
        var screen = require('screener').screen;
        var mapping = require('./../libs/mapping');

        var routes = {
            list: function(req, res) {
                return routes.listWithFilter({}, req, res);
            },
            listByUser: function(req, res) {
                return routes.listWithFilter({user: req.params.id}, req, res);
            },
            listByServer: function(req, res) {
                return routes.listWithFilter({server: req.params.id}, req, res);
            },
            post: function(req, res) {
                var sessions = [];

                if (_.isArray(req.body)) {
                    sessions = _.map(req.body, function(object) {
                        return object;
                    });
                } else {
                    sessions = [req.body];
                }

                if (_.size(sessions)) {
                    SessionProvider.saveMultiple(sessions, function(err, sessions) {
                        if (!err) {
                            res.statusCode = 201;

                            return res.send(screen(sessions, SessionProvider.screens.postCollection));
                        } else {
                            if(err.name === 'ValidationError') {
                                res.statusCode = 400;

                                return res.send({ errors: errorHelper(err)});
                            } else {
                                res.statusCode = 500;
                                log.error('Internal error(%d): %s', res.statusCode, err.message);

                                return res.send({ error: 'Server error' });
                            }
                        }
                    });
                } else {
                    res.statusCode = 400;
                    if (!_.size(sessions)) {
                        return res.send({ error: 'Empty request' });
                    } else {
                        return res.send({ error: 'Server error' });
                    }
                }
            },
            get: function(req, res) {
                return SessionProvider.getById(req.params.id, function(err, session) {
                    if (!session) {
                        res.statusCode = 404;

                        return res.send({ error: 'Not found' });
                    } else {
                        return res.send(screen(session, SessionProvider.screens.model));
                    }
                });
            },
            listWithFilter: function(where, req, res) {
                return SessionProvider.findAll(where, function(err, sessions) {
                    if (!err) {
                        return res.send(screen(sessions, SessionProvider.screens.collection));
                    } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s', res.statusCode, err.message);

                        return res.send({ error: 'Server error' });
                    }
                });
            }
        };

        app.get('/api/sessions', routes.list);
        app.post('/api/sessions', routes.post);
        app.get('/api/sessions/:id', routes.get);
        app.get('/api/users/:id/sessions', routes.listByUser);
        app.get('/api/servers/:id/sessions', routes.listByServer);
    };
})();
