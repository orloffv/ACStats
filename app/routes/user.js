(function () {
    "use strict";
    module.exports = function(app, mongoose, log) {
        var _          = require('underscore');

        var UserProvider = require('../data-provider/user')(mongoose, log);
        var errorHelper = require('mongoose-error-helper').errorHelper;
        var screen = require('screener').screen;
        var mapping = require('./../libs/mapping');

        var routes = {
            list: function(req, res) {
                return UserProvider.findAll(function(err, users) {
                    if (!err) {
                        return res.send(screen(users, UserProvider.screens.collection));
                    } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s', res.statusCode, err.message);

                        return res.send({ error: 'Server error' });
                    }
                });
            },
            listByServer: function(req, res) {
                return UserProvider.findAll({server: req.params.id}, function(err, users) {
                    if (!err) {
                        return res.send(screen(users, UserProvider.screens.collection));
                    } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s', res.statusCode, err.message);

                        return res.send({ error: 'Server error' });
                    }
                });
            },
            get: function(req, res) {
                return UserProvider.getById(req.params.id, function(err, user) {
                    if (!user) {
                        res.statusCode = 404;

                        return res.send({ error: 'Not found' });
                    } else {
                        return res.send(screen(user, UserProvider.screens.model));
                    }
                });
            }
        };

        app.get('/api/users', routes.list);
        app.get('/api/users/:id', routes.get);
        app.get('/api/servers/:id/users', routes.listByServer);
    };
})();
