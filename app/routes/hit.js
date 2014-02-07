(function () {
    "use strict";
    module.exports = function(app, mongoose, log) {
        var _          = require('underscore');

        var HitProvider = require('../data-provider/hit')(mongoose, log);
        var errorHelper = require('mongoose-error-helper').errorHelper;
        var screen = require('screener').screen;
        var mapping = require('./../libs/mapping');

        var routes = {
            list: function(req, res) {
                return HitProvider.findAll(function(err, hits) {
                    if (!err) {
                        return res.send(screen(hits, HitProvider.screens.collection));
                    } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s', res.statusCode, err.message);
                        return res.send({ error: 'Server error' });
                    }
                });
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

                            return res.send(screen(hits, HitProvider.screens.postCollection));
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
            }
        };

        app.get('/api/hits', routes.list);
        app.post('/api/hits', routes.post);
        app.get('/api/hits/:id', routes.get);
    };
})();
