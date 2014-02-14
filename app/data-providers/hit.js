(function () {
    "use strict";
    module.exports = function(mongoose, log) {
        var _          = require('underscore');
        var async      = require('async');
        var validate = require('jsonschema').validate;
        var HitModel = mongoose.model('Hit');
        var HitSchema = require('./schemas/hit.json');
        var ServerProvider = require('./server')(mongoose, log);
        var UserProvider = require('./user')(mongoose, log);

        var HitProvider = function () {};

        HitProvider.prototype = {
            findAll: function (where, callback) {
                HitModel.find(where).populate('user server').exec(callback);
            },
            findAllWithGroupByUrl: function(where, callback) {
                HitModel.findAllWithGroupByUrl(where, callback);
            },
            count: function(where, callback) {
                HitModel.count(where, callback);
            },
            countGrouped: function(where, parts, callback) {
                HitModel.countGrouped(where, parts, callback);
            },
            getById: function(id, callback) {
                HitModel.findById(id).populate('user server').exec(callback);
            },
            save: function (hit, callback) {
                var hitValidate = validate(hit, HitSchema);
                if (!_.size(hitValidate.errors)) {
                    ServerProvider.findOrCreate(hit.server.name, function(err, server, serverCreated) {
                        UserProvider.findOrCreate(hit.user.name, server.id, {additional: hit.user.additional}, function(err, user, userCreated) {
                            hit.server = server.id;
                            hit.user = user.id;

                            new HitModel(hit).save(function (err, hit) {
                                if (!err) {
                                    var toSave = {};

                                    if (_.isNumber(user.hits)) {
                                        user.hits++;
                                    } else {
                                        user.hits = 1;
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
                                            callback(err, hit);
                                        }
                                    );
                                } else {
                                    callback(err, hit);
                                }
                            });
                        });
                    });
                } else {
                    callback({name: 'SchemaError', errors: _.pluck(hitValidate.errors, 'stack')}, hit);
                }
            },
            saveMultiple: function(data, callback) {
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
            },
            screens: HitModel.screens
        };

        return new HitProvider();
    };
})();
