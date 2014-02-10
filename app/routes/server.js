(function () {
    "use strict";
    module.exports = function(app, mongoose, log) {
        var _          = require('underscore');

        var ServerProvider = require('../data-providers/server')(mongoose, log);
        var errorHelper = require('mongoose-error-helper').errorHelper;
        var screen = require('screener').screen;
        var mapping = require('./../libs/mapping');

        var routes = {
            list: function(req, res) {
                return ServerProvider.findAll(function(err, servers) {
                    if (!err) {
                        return res.send(screen(servers, ServerProvider.screens.collection));
                    } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s', res.statusCode, err.message);

                        return res.send({ error: 'Server error' });
                    }
                });
            },
            get: function(req, res) {
                return ServerProvider.getById(req.params.id, function(err, server) {
                    if (!server) {
                        res.statusCode = 404;

                        return res.send({ error: 'Not found' });
                    } else {
                        return res.send(screen(server, ServerProvider.screens.model));
                    }
                });
            }
        };

        app.get('/api/servers', routes.list);
        app.get('/api/servers/:id', routes.get);
    };
})();
