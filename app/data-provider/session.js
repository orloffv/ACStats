(function () {
    "use strict";
    module.exports = function(mongoose, log) {
        var _          = require('underscore');
        var async      = require('async');
        var SessionModel = mongoose.model('Session');
        var ServerModel = mongoose.model('Server');
        var UserModel = mongoose.model('User');

        var SessionProvider = function () {};

        SessionProvider.prototype.findAll = function (callback) {
            SessionModel.find({}).populate('user server').exec(callback);
        };

        SessionProvider.prototype.save = function (session, callback) {
            ServerModel.findOrCreate(session.server, function(err, server, created) {
                UserModel.findOrCreate({name: session.user.name, server: server.id}, session.user.additional, function(err, user, created) {
                    session.server = server.id;
                    session.user = user.id;

                    new SessionModel(session).save(function (err, session) {
                        if (!err) {
                            if (_.isArray(server.sessions)) {
                                server.sessions.push(session.id);
                            } else {
                                server.sessions = [session.id];
                            }

                            if (_.isArray(user.sessions)) {
                                user.sessions.push(session.id);
                            } else {
                                user.sessions = [session.id];
                            }

                            async.parallel(
                                {
                                    server: function(callback) {
                                        server.save(callback);
                                    },
                                    user: function(callback) {
                                        user.save(callback);
                                    }
                                },
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
        };

        SessionProvider.prototype.saveMultiple = function(sessions, callback) {
            async.map(sessions,
                function(session, callback) {
                    SessionProvider.prototype.save(session, callback);
                }, function(err, sessions) {
                    callback(err, sessions);
                }
            );
        };

        SessionProvider.prototype.screens = SessionModel.screens;

        return new SessionProvider();
    };
})();
