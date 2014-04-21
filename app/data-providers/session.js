(function () {
    "use strict";
    module.exports = function(mongoose, log) {
        var _          = require('underscore');
        var async      = require('async');
        var SessionModel = mongoose.model('Session');
        var ServerProvider = require('./server')(mongoose, log);
        var UserProvider = require('./user')(mongoose, log);
        var QueryHelper = require('./../libs/query-helper')(mongoose);

        var SessionProvider = function () {};

        SessionProvider.prototype = {
            findAll: function (where, options, callback) {
                var queryOptions = QueryHelper.getOptions(where, options);

                SessionModel.find(queryOptions.where).populate('user').sort(queryOptions.sort).exec(callback);
            },
            getById: function(id, callback) {
                SessionModel.findById(id).populate('user').exec(callback);
            },
            countGroupByPartDate: function(where, parts, callback) {
                SessionModel.countGroupByPartDate(where, parts, callback);
            },
            getTimingGroupByPartDate: function(where, parts, callback) {
                SessionModel.getTimingGroupByPartDate(where, parts, callback);
            },
            finUserUserAgents: function(where, limit, callback) {
                SessionModel.finUserUserAgents(where, limit, callback);
            },
            findBrowsers: function(options, callback) {
                SessionModel.findBrowsers(options, callback);
            },
            findCities: function(options, callback) {
                SessionModel.findCities(options, callback);
            },
            count: function(where, callback) {
                SessionModel.count(where, callback);
            },
            findOrCreate: function(sessionId, updateOptions, callback) {
                if (!sessionId) {
                    return callback(false, null, false);
                }
                delete updateOptions.id;
                SessionModel.findOrCreate({sessionClientId: mongoose.Types.ObjectId(sessionId)}, updateOptions, callback);
            },
            save: function (session, callback) {
                var that = this;
                ServerProvider.findOrCreate(session.server.name, function(err, server, serverCreated) {
                    UserProvider.findOrCreate(session.user.name, server.id, {additional: session.user.additional, createdAt: session.createdAt}, function(err, user, userCreated) {
                        session.server = server.id;
                        session.user = user.id;
                        that.findOrCreate(session.id, session, function(err, session, sessionCreated) {
                            if (!err) {
                                var toSave = {};

                                if (_.isNumber(user.sessions)) {
                                    user.sessions++;
                                } else {
                                    user.sessions = 1;
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
                                        callback(err, session);
                                    }
                                );
                            } else {
                                callback(err, session);
                            }
                        });
                    });
                });
            },
            saveMultiple: function(data, callback, options) {
                var toSave = [], sessions = [], that = this;
                options = options || {};

                sessions = _.isArray(data) ? data : [data];

                if (!_.size(sessions)) {
                    return callback({name: 'Empty'});
                }

                toSave = _.map(sessions, function(session) {
                    session = _.extend(session, {useragent: options.useragent, ip: options.ip});

                    return function(cb) {
                        return that.save.call(that, session, cb);
                    };
                });

                async.series(toSave,
                    function(err, sessions) {
                        callback(err, sessions);
                    }
                );
            },
            screens: SessionModel.screens
        };

        return new SessionProvider();
    };
})();
