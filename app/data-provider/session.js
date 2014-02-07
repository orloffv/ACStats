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

        SessionProvider.prototype.getById = function(id, callback) {
            SessionModel.findById(id).populate('user server').exec(callback);
        };

        SessionProvider.prototype.save = function (session, callback) {
            ServerModel.findOrCreate(session.server, function(err, server, serverCreated) {
                UserModel.findOrCreate({name: session.user.name, server: server.id}, {additional: session.user.additional}, function(err, user, userCreated) {
                    session.server = server.id;
                    session.user = user.id;

                    new SessionModel(session).save(function (err, session) {
                        if (!err) {
                            var toSave = {};

                            if (_.isArray(user.sessions)) {
                                user.sessions.push(session.id);
                            } else {
                                user.sessions = [session.id];
                            }

                            user.sessions = _.uniq(user.sessions);

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
