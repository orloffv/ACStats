(function () {
    "use strict";
    module.exports = function(app, mongoose, log) {
        var _          = require('underscore');
        var EventModel = mongoose.model('Event');
        var errorHelper = require('mongoose-error-helper').errorHelper;
        var screen = require('screener').screen;
        var mapping = require('./../libs/mapping');

        var routes = {
            list: function(req, res){
                var filter = {};
                if (req.query.project) {
                    filter.project = req.query.project;
                }
                if (req.query.environment) {
                    filter.environment = req.query.environment;
                }
                return EventModel.find(filter, function (err, events) {
                    if (!err) {
                        return res.send(screen(events, EventModel.screens.collection));
                    } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s', res.statusCode, err.message);
                        return res.send({ error: 'Server error' });
                    }
                });
            },
            get: function(req, res) {
                return EventModel.findById(req.params.id, function (err, event) {
                    if (!event) {
                        res.statusCode = 404;
                        return res.send({ error: 'Not found' });
                    }

                    if (!err) {
                        return res.send(screen(event, EventModel.screens.model));
                    } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s', res.statusCode, err.message);
                        return res.send({ error: 'Server error' });
                    }
                });
            },
            post: function(req, res) {
                var event, events = [];

                if (_.isArray(req.body)) {
                    events = _.map(req.body, function(object) {
                        return object;
                    });
                } else {
                    event = req.body;
                }

                if (event) {
                    new EventModel(event).save(function (err, event) {
                        if (!err) {
                            res.statusCode = 201;
                            return res.send(screen(event, EventModel.screens.postModel));
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
                } else if (_.size(events)) {
                    EventModel.create(events, function(err) {
                        if (!err) {
                            res.statusCode = 201;
                            return res.send(screen(_.rest(arguments), EventModel.screens.postCollection));
                        } else {
                            if(err.name === 'ValidationError') {
                                res.statusCode = 400;
                                res.send({ errors: errorHelper(err)});
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
                        res.send({ error: 'Empty request' });
                    } else {
                        return res.send({ error: 'Server error' });
                    }
                }
            },
            delete: function(req, res) {

            },
            put: function(req, res) {

            },
            projects: function(req, res) {
                return EventModel.findAllProjects(function (err, projects) {
                    if (!err) {
                        return res.send(mapping(projects, {title: '_id'}));
                    } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s', res.statusCode, err.message);
                        return res.send({ error: 'Server error' });
                    }
                });
            },
            grouped: function(req, res) {
                return EventModel.findGrouped(req.query.project, req.query.environment, function (err, events) {
                    if (!err) {
                        return res.send(mapping(events, {title: '_id'}));
                    } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s', res.statusCode, err.message);
                        return res.send({ error: 'Server error' });
                    }
                });
            }
        };

        app.get('/api/events', routes.list);
        app.post('/api/events', routes.post);
        app.get('/api/events/grouped', routes.grouped);
        app.get('/api/events/projects', routes.projects);
        app.get('/api/events/:id', routes.get);
        app.put('/api/events/:id', routes.put);
        app.delete('/api/events/:id', routes.delete);
    };
})();
