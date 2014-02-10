(function () {
    "use strict";
    module.exports = function(app, mongoose, log) {
        var _          = require('underscore');

        var HitProvider = require('../data-providers/hit')(mongoose, log);
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
            listBySession: function(req, res) {
                return routes.listWithFilter({session: req.params.id}, req, res);
            },
            post: function(req, res) {
                var hits = [];

                if (_.isArray(req.body)) {
                    hits = _.map(req.body, function(object) {
                        return object;
                    });
                } else {
                    hits = [req.body];
                }

                if (_.size(hits)) {
                    HitProvider.saveMultiple(hits, function(err, hits) {
                        if (!err) {
                            res.statusCode = 201;

                            if (_.size(hits) === 1) {
                                return res.send(screen(hits[0], HitProvider.screens.postModel));
                            } else {
                                return res.send(screen(hits, HitProvider.screens.postCollection));
                            }
                        } else {
                            if (err.name === 'SchemaError') {
                                res.statusCode = 400;

                                return res.send({ errors: err.errors});
                            } else if (err.name === 'ValidationError') {
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
                    if (!_.size(hits)) {
                        return res.send({ error: 'Empty request' });
                    } else {
                        return res.send({ error: 'Server error' });
                    }
                }
            },
            get: function(req, res) {
                return HitProvider.getById(req.params.id, function(err, hit) {
                    if (!hit) {
                        res.statusCode = 404;

                        return res.send({ error: 'Not found' });
                    } else {
                        return res.send(screen(hit, HitProvider.screens.model));
                    }
                });
            },
            listWithFilter: function(where, req, res) {
                return HitProvider.findAll(where, function(err, hits) {
                    if (!err) {
                        return res.send(screen(hits, HitProvider.screens.collection));
                    } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s', res.statusCode, err.message);
                        return res.send({ error: 'Server error' });
                    }
                });
            }
        };

        app.get('/api/hits', routes.list);
        app.post('/api/hits', routes.post);
        app.get('/api/hits/:id', routes.get);
        app.get('/api/users/:id/hits', routes.listByUser);
        app.get('/api/servers/:id/hits', routes.listByServer);
        app.get('/api/sessions/:id/hits', routes.listBySession);
    };
})();
