(function () {
    "use strict";
    module.exports = function(mongoose, log) {
        var _          = require('underscore');
        var async      = require('async');
        var validate = require('jsonschema').validate;
        var HitModel = mongoose.model('Hit');
        var UserModel = mongoose.model('User');
        var SessionModel = mongoose.model('Session');
        var ServerModel = mongoose.model('Server');
        var HitSchema = require('./schemas/hit.json');

        var HitProvider = function () {};

        HitProvider.prototype.findAll = function (where, callback) {
            HitModel.find(where).populate('user server').exec(callback);
        };

        HitProvider.prototype.getById = function(id, callback) {
            HitModel.findById(id).populate('user server').exec(callback);
        };

        HitProvider.prototype.save = function (hit, callback) {
            var hitValidate = validate(hit, HitSchema);
            if (!_.size(hitValidate.errors)) {
                ServerModel.findOrCreate(hit.server, function(err, server, serverCreated) {
                    UserModel.findOrCreate({name: hit.user.name, server: server.id}, {additional: hit.user.additional}, function(err, user, userCreated) {
                        hit.server = server.id;
                        hit.user = user.id;
                        SessionModel.findOrCreate({id: hit.session}, {server: hit.server, user: hit.user}, function(err, session, sessionCreated) {
                            hit.session = session.id;

                            new HitModel(hit).save(function (err, hit) {
                                if (!err) {
                                    var toSave = {};

                                    if (_.isArray(user.hits)) {
                                        user.hits.push(hit.id);
                                    } else {
                                        user.hits = [hit.id];
                                    }

                                    user.hits = _.uniq(user.hits);

                                    if (sessionCreated) {
                                        if (_.isArray(user.sessions)) {
                                            user.sessions.push(hit.session);
                                        } else {
                                            user.sessions = [hit.session];
                                        }

                                        user.sessions = _.uniq(user.sessions);
                                    }

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
                                            callback(err, hit);
                                        }
                                    );
                                } else {
                                    callback(err, hit);
                                }
                            });
                        });
                    });
                });
            } else {
                callback({name: 'SchemaError', errors: _.pluck(hitValidate.errors, 'stack')}, hit);
            }
        };

        HitProvider.prototype.saveMultiple = function(data, callback) {
            var toSave = [], hits = [], that = this;

            if (_.isArray(data)) {
                hits = _.map(data, function(object) {
                    return object;
                });
            } else {
                hits = [data];
            }

            if (!_.size(hits)) {
                return callback({name: 'Empty'});
            }

            toSave = _.map(hits, function(hit) {
                return function(cb) {
                    return that.save(hit, cb);
                };
            });

            async.series(toSave,
                function(err, hits) {
                    callback(err, hits);
                }
            );
        };

        HitProvider.prototype.screens = HitModel.screens;

        return new HitProvider();
    };
})();