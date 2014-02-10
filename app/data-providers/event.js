(function () {
    "use strict";
    module.exports = function(mongoose, log) {
        var _          = require('underscore');
        var async      = require('async');
        var validate = require('jsonschema').validate;
        var EventModel = mongoose.model('Event');
        var UserModel = mongoose.model('User');
        var ServerModel = mongoose.model('Server');
        var EventSchema = require('./schemas/event.json');

        var EventProvider = function () {};

        EventProvider.prototype.findAll = function(where, callback) {
            EventModel.find(where).populate('user server').exec(callback);
        };

        EventProvider.prototype.findAllWithGroupByName = function(where, callback) {
            EventModel.findAllWithGroupByName(where, callback);
        };

        EventProvider.prototype.getById = function(id, callback) {
            EventModel.findById(id).populate('user server').exec(callback);
        };

        EventProvider.prototype.save = function(event, callback) {
            var eventValidate = validate(event, EventSchema);
            if (!_.size(eventValidate.errors)) {
                ServerModel.findOrCreate(event.server, function(err, server, serverCreated) {
                    UserModel.findOrCreate({name: event.user.name, server: server.id}, {additional: event.user.additional}, function(err, user, userCreated) {
                        event.server = server.id;
                        event.user = user.id;

                        new EventModel(event).save(function (err, event) {
                            if (!err) {
                                var toSave = {};

                                if (_.isArray(user.events)) {
                                    user.events.push(event.id);
                                } else {
                                    user.events = [event.id];
                                }

                                user.events = _.uniq(user.events);

                                toSave.user = function(callback) {
                                    user.save(callback);
                                };

                                if (serverCreated || userCreated) {
                                    if (_.isArray(server.users)) {
                                        server.users.push(user.id);
                                    } else {
                                        server.users = [user.id];
                                    }

                                    server.users = _.uniq(server.users);

                                    toSave.server = function(callback) {
                                        server.save(callback);
                                    };
                                }

                                async.parallel(toSave,
                                    function(e, r) {
                                        callback(err, event);
                                    }
                                );
                            } else {
                                callback(err, event);
                            }
                        });
                    });
                });
            } else {
                callback({name: 'SchemaError', errors: _.pluck(eventValidate.errors, 'stack')}, event);
            }
        };

        EventProvider.prototype.saveMultiple = function(events, callback) {
            var toSave = [];

            toSave = _.map(events, function(event) {
                return function(cb) {
                    return EventProvider.prototype.save(event, cb);
                };
            });

            async.series(toSave,
                function(err, events) {
                    callback(err, events);
                }
            );
        };

        EventProvider.prototype.screens = EventModel.screens;

        return new EventProvider();
    };
})();
