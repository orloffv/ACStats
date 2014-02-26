(function () {
    "use strict";
    module.exports = function(app, mongoose, log) {
        var _          = require('underscore');

        var HitProvider = require('../data-providers/hit')(mongoose, log);
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
            listBySession: function(req, res) {
                return routes.listWithFilter({session: req.params.id}, req, res);
            },
            post: function(req, res) {
                HitProvider.saveMultiple(req.body, function(err, hits) {
                    if (!err) {
                        res.statusCode = 201;

                        if (_.size(hits) === 1) {
                            return res.send(screen(hits[0], HitProvider.screens.postModel));
                        } else {
                            return res.send(screen(hits, HitProvider.screens.postCollection));
                        }
                    } else {
                        return errorHelper(err, res);
                    }
                });
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
                        return errorHelper(err, res);
                    }
                });
            },
            listWithFilerGrouped: function(where, req, res) {
                return HitProvider.findAllWithGroupByUrl(where, {query:req.query}, function(err, hits) {
                    if (!err) {
                        return res.send(screen(hits, HitProvider.screens.groupedCollection));
                    } else {
                        return errorHelper(err, res);
                    }
                });
            },
            listByUserGrouped: function(req, res) {
                return routes.listWithFilerGrouped({user: req.params.id}, req, res);
            },
            listByServerGrouped: function(req, res) {
                return routes.listWithFilerGrouped({server: req.params.id}, req, res);
            }
        };

        app.get('/api/hits', routes.list);
        app.post('/api/hits', routes.post);
        app.get('/api/hits/:id', routes.get);
        app.get('/api/users/:id/hits', routes.listByUser);
        app.get('/api/servers/:id/hits', routes.listByServer);
        app.get('/api/sessions/:id/hits', routes.listBySession);
        app.get('/api/users/:id/hits/grouped', routes.listByUserGrouped);
        app.get('/api/servers/:serverId/users/:id/hits/grouped', routes.listByUserGrouped);
        app.get('/api/servers/:id/hits/grouped', routes.listByServerGrouped);
    };
})();
