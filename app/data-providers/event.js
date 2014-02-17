(function () {
    "use strict";
    module.exports = function(mongoose, log) {
        var _          = require('underscore');
        var async      = require('async');
        var validate = require('jsonschema').validate;
        var EventModel = mongoose.model('Event');
        var ServerProvider = require('./server')(mongoose, log);
        var UserProvider = require('./user')(mongoose, log);
        var EventSchema = require('./schemas/event.json');
        var QueryHelper = require('./../libs/query-helper')(mongoose);

        var EventProvider = function () {};

        EventProvider.prototype = {
            findAll: function(where, callback) {
                EventModel.find(where).populate('user server').exec(callback);
            },
            findAllWithGroupByName: function(where, callback) {
                EventModel.findAllWithGroupByName(QueryHelper.getWhere(where), callback);
            },
            count: function(where, callback) {
                EventModel.count(where, callback);
            },
            countGroupByPartDate: function(where, parts, callback) {
                EventModel.countGroupByPartDate(where, parts, callback);
            },
            findEventPopularByDate: function(where, limit, callback) {
                EventModel.findEventPopularByDate(where, limit, callback);
            },
            getById: function(id, callback) {
                EventModel.findById(id).populate('user server').exec(callback);
            },
            save: function(event, callback) {
                var eventValidate = validate(event, EventSchema);
                if (!_.size(eventValidate.errors)) {
                    ServerProvider.findOrCreate(event.server.name, function(err, server, serverCreated) {
                        UserProvider.findOrCreate(event.user.name, server.id, {additional: event.user.additional}, function(err, user, userCreated) {
                            event.server = server.id;
                            event.user = user.id;

                            new EventModel(event).save(function (err, event) {
                                if (!err) {
                                    var toSave = {};

                                    if (_.isNumber(user.events)) {
                                        user.events++;
                                    } else {
                                        user.events = 1;
                                    }

                                    toSave.user = function(callback) {
                                        user.save(callback);
                                    };

                                    if (serverCreated || userCreated) {
                                        if (_.isNumber(server.users)) {
                                            server.users++;
                                        } else {
                                            server.users = 1;
                                        }

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
            },
            saveMultiple: function(data, callback) {
                var toSave = [], events = [],  that = this;

                if (_.isArray(data)) {
                    events = _.map(data, function(object) {
                        return object;
                    });
                } else {
                    events = [data];
                }

                if (!_.size(events)) {
                    return callback({name: 'Empty'});
                }

                toSave = _.map(events, function(event) {
                    return function(cb) {
                        return that.save(event, cb);
                    };
                });

                async.series(toSave,
                    function(err, events) {
                        callback(err, events);
                    }
                );
            },
            screens: EventModel.screens
        };

        return new EventProvider();
    };
})();
