(function () {
    "use strict";
    module.exports = function(mongoose, log) {
        var _          = require('underscore');
        var async      = require('async');
        var validate = require('jsonschema').validate;
        var TimeModel = mongoose.model('Time');
        var TimeSchema = require('./schemas/time.json');
        var QueryHelper = require('./../libs/query-helper')(mongoose);
        var ServerProvider = require('./server')(mongoose, log);
        var UserProvider = require('./user')(mongoose, log);
        var TimeProvider = function () {};

        TimeProvider.prototype = {
            findTimeSlowestByDate: function(where, limit, callback) {
                TimeModel.findTimeSlowestByDate(where, limit, callback);
            },
            save: function (time, callback) {
                var timeValidate = validate(time, TimeSchema);
                if (!_.size(timeValidate.errors)) {
                    ServerProvider.findOrCreate(time.server.name, function(err, server, serverCreated) {
                        UserProvider.findOrCreate(time.user.name, server.id, {additional: time.user.additional, createdAt: time.createdAt}, function(err, user, userCreated) {
                            time.server = server.id;
                            time.user = user.id;

                            new TimeModel(time).save(function (err, time) {
                                if (!err) {
                                    var toSave = {};

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
                                            callback(err, time);
                                        }
                                    );
                                } else {
                                    callback(err, time);
                                }
                            });
                        });
                    });
                } else {
                    callback({name: 'SchemaError', errors: _.pluck(timeValidate.errors, 'stack')}, time);
                }
            },
            saveMultiple: function(data, callback) {
                var toSave = [], times = [], that = this;

                times = _.isArray(data) ? data : [data];

                if (!_.size(times)) {
                    return callback({name: 'Empty'});
                }

                toSave = _.map(times, function(time) {
                    return function(cb) {
                        return that.save(time, cb);
                    };
                });

                async.series(toSave,
                    function(err, times) {
                        callback(err, times);
                    }
                );
            },
            screens: TimeModel.screens
        };

        return new TimeProvider();
    };
})();
