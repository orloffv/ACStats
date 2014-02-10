(function () {
    "use strict";
    module.exports = function(app, mongoose, log) {
        var _          = require('underscore');

        var SessionProvider = require('../data-providers/session')(mongoose, log);
        var errorHelper = require('./../libs/error-helper')(log);
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
                SessionProvider.saveMultiple(req.body, function(err, sessions) {
                    if (!err) {
                        res.statusCode = 201;

                        return res.send(screen(sessions, SessionProvider.screens.postCollection));
                    } else {
                        return errorHelper(err, res);
                    }
                });
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
