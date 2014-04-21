(function () {
    "use strict";
    module.exports = function(mongoose, log) {
        var _          = require('underscore');
        var async      = require('async');
        var validate = require('jsonschema').validate;
        var HitModel = mongoose.model('Hit');
        var HitSchema = require('./schemas/hit.json');
        var ServerProvider = require('./server')(mongoose, log);
        var SessionProvider = require('./session')(mongoose, log);
        var UserProvider = require('./user')(mongoose, log);
        var QueryHelper = require('./../libs/query-helper')(mongoose);

        var HitProvider = function () {};

        HitProvider.prototype = {
            findAll: function (where, callback) {
                HitModel.find(where, callback);
            },
            findUsers: function(where, callback) {
                HitModel.distinct('user', where, callback);
            },
            findAllWithGroupByUrl: function(where, options, callback) {
                HitModel.findAllWithGroupByUrl(QueryHelper.getOptions(where, options), function(err ,result) {
                    if (!err) {
                        result = _.map(result, function(item) {
                            item.users = _.size(item.users);

                            return item;
                        });
                    }

                    callback(err, result);
                });
            },
            count: function(where, callback) {
                HitModel.count(where, callback);
            },
            countGroupByPartDate: function(where, parts, callback) {
                HitModel.countGroupByPartDate(where, parts, callback);
            },
            findHitSlowestByDate: function(where, limit, callback) {
                HitModel.findHitSlowestByDate(where, limit, callback);
            },
            getById: function(id, callback) {
                HitModel.findById(id).populate('user server').exec(callback);
            },
            save: function (hit, callback) {
                var hitValidate = validate(hit, HitSchema);
                if (!_.size(hitValidate.errors)) {
                    ServerProvider.findOrCreate(hit.server.name, function(err, server, serverCreated) {
                        UserProvider.findOrCreate(hit.user.name, server.id, {additional: hit.user.additional, createdAt: hit.createdAt}, function(err, user, userCreated) {
                            SessionProvider.findOrCreate(hit.session, {server: server.id, user: user.id, useragent: hit.useragent, ip: hit.ip}, function(err, session, sessionCreated) {
                                hit.server = server.id;
                                hit.user = user.id;
                                hit.session = session.id;

                                new HitModel(hit).save(function (err, hit) {
                                    if (!err) {
                                        var toSave = {};

                                        if (_.isNumber(user.hits)) {
                                            user.hits++;
                                        } else {
                                            user.hits = 1;
                                        }

                                        if (_.isNumber(session.hits)) {
                                            session.hits++;
                                        } else {
                                            session.hits = 1;
                                        }

                                        toSave.session = function(callback) {
                                            session.save(callback);
                                        };

                                        user.lastHitAt = new Date();

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
            },
            saveMultiple: function(data, callback) {
                var toSave = [], hits = [], that = this;

                hits = _.isArray(data) ? data : [data];

                if (!_.size(hits)) {
                    return callback({name: 'Empty'});
                }

                toSave = _.map(hits, function(hit) {
                    return function(cb) {
                        return that.save.call(that, hit, cb);
                    };
                });

                async.series(toSave,
                    function(err, hits) {
                        callback(err, hits);
                    }
                );
            },
            screens: HitModel.screens
        };

        return new HitProvider();
    };
})();
