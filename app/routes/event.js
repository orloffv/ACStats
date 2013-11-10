(function () {
    "use strict";
    module.exports = function(EventModel) {
        var log        = require('../libs/log')(module);
        var _          = require('underscore');

        return {
            list: function(req, res){
                return EventModel.find(function (err, events) {
                    if (!err) {
                        return res.send(events);
                    } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s',res.statusCode,err.message);
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
                        return res.send(event);
                    } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s',res.statusCode,err.message);
                        return res.send({ error: 'Server error' });
                    }
                });
            },
            post: function(req, res) {
                var getEventObject = function(body) {
                    return {
                        title: body.event.title,
                        environment: body.environment,
                        project: body.project,
                        context: body.event.context,
                        traits: body.traits,
                        user: {
                            id: body.user.id,
                            traits: body.user.traits,
                            context: body.user.context
                        }
                    };
                };

                var event, events;

                if (_.isArray(req.body)) {
                    events = _.map(req.body, function(object) {
                        return getEventObject(object);
                    });
                } else {
                    event = getEventObject(req.body);
                }

                if (event) {
                    new EventModel(event).save(function (err, event) {
                        if (!err) {
                            res.statusCode = 201;
                            return res.send({ id: event._id });
                        } else {
                            if(err.name === 'ValidationError') {
                                res.statusCode = 400;
                                res.send({ error: 'Validation error' });
                            } else {
                                res.statusCode = 500;
                                res.send({ error: 'Server error' });
                            }
                            log.error('Internal error(%d): %s',res.statusCode,err.message);
                        }
                    });
                } else if (events) {
                    EventModel.create(events, function(err) {
                        if (!err) {
                            var ids =
                                _.chain(arguments)
                                    .rest()
                                    .map(function(model) {return {id: model._id};})
                                    .value();

                            res.statusCode = 201;
                            return res.send(ids);
                        } else {
                            if(err.name === 'ValidationError') {
                                res.statusCode = 400;
                                res.send({ error: 'Validation error' });
                            } else {
                                res.statusCode = 500;
                                res.send({ error: 'Server error' });
                            }
                            log.error('Internal error(%d): %s',res.statusCode,err.message);
                        }
                    });
                } else {
                    res.statusCode = 400;
                    return res.send({ error: 'Server error' });
                }
            },
            delete: function(req, res) {

            },
            put: function(req, res) {

            }
        };
    };
})();
