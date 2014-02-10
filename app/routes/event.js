(function () {
    "use strict";
    module.exports = function(app, mongoose, log) {
        var _          = require('underscore');

        var EventProvider = require('../data-providers/event')(mongoose, log);
        var errorHelper = require('mongoose-error-helper').errorHelper;
        var screen = require('screener').screen;
        var mapping = require('./../libs/mapping');

        var routes = {
            list: function(req, res) {
                return routes.listWithFilter({}, req, res);
            },
            listByServer: function(req, res) {
                return routes.listWithFilter({server: req.params.id}, req, res);
            },
            listByUser: function(req, res) {
                return routes.listWithFilter({user: req.params.id}, req, res);
            },
            post: function(req, res) {
                var events = [];

                if (_.isArray(req.body)) {
                    events = _.map(req.body, function(object) {
                        return object;
                    });
                } else {
                    events = [req.body];
                }

                if (_.size(events)) {
                    EventProvider.saveMultiple(events, function(err, events) {
                        if (!err) {
                            res.statusCode = 201;
                            if (_.size(events) === 1) {
                                return res.send(screen(events[0], EventProvider.screens.postModel));
                            } else {
                                return res.send(screen(events, EventProvider.screens.postCollection));
                            }
                        } else {
                            if (err.name === 'SchemaError') {
                                res.statusCode = 400;

                                return res.send({ errors: err.errors});
                            } else if(err.name === 'ValidationError') {
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
                    if (!_.size(events)) {
                        return res.send({ error: 'Empty request' });
                    } else {
                        return res.send({ error: 'Server error' });
                    }
                }
            },
            get: function(req, res) {
                return EventProvider.getById(req.params.id, function(err, event) {
                    if (!event) {
                        res.statusCode = 404;

                        return res.send({ error: 'Not found' });
                    } else {
                        return res.send(screen(event, EventProvider.screens.model));
                    }
                });
            },
            listWithFilter: function(where, req, res) {
                return EventProvider.findAll(where, function(err, events) {
                    if (!err) {
                        return res.send(screen(events, EventProvider.screens.collection));
                    } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s', res.statusCode, err.message);
                        return res.send({ error: 'Server error' });
                    }
                });
            },
            listWithFilerGrouped: function(where, req, res) {
                return EventProvider.findAllWithGroupByName(where, function(err, events) {
                    if (!err) {
                        return res.send(screen(events, EventProvider.screens.groupedCollection));
                    } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s', res.statusCode, err.message);
                        return res.send({ error: 'Server error' });
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

        app.get('/api/events', routes.list);
        app.post('/api/events', routes.post);
        app.get('/api/events/:id', routes.get);
        app.get('/api/servers/:id/events', routes.listByServer);
        app.get('/api/users/:id/events', routes.listByUser);
        app.get('/api/users/:id/events/grouped', routes.listByUserGrouped);
        app.get('/api/servers/:id/events/grouped', routes.listByServerGrouped);
    };
})();
