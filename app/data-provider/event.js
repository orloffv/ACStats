(function () {
    "use strict";
    module.exports = function(mongoose, log) {
        var _          = require('underscore');
        var async      = require('async');
        var EventModel = mongoose.model('Event');
        var UserModel = mongoose.model('User');
        var ServerModel = mongoose.model('Server');

        var EventProvider = function () {};

        EventProvider.prototype.findAll = function(callback) {
            EventModel.find({}).populate('user server').exec(callback);
        };

        EventProvider.prototype.getById = function(id, callback) {
            EventModel.findById(id).populate('user server').exec(callback);
        };

        EventProvider.prototype.save = function(event, callback) {
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
        };

        EventProvider.prototype.saveMultiple = function(events, callback) {
            async.map(events,
                function(event, callback) {
                    EventProvider.prototype.save(event, callback);
                }, function(err, events) {
                    callback(err, events);
                }
            );
        };

        EventProvider.prototype.screens = EventModel.screens;

        return new EventProvider();
    };
})();
