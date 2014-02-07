(function () {
    "use strict";
    module.exports = function(mongoose, log) {
        var _          = require('underscore');
        var async      = require('async');
        var HitModel = mongoose.model('Hit');
        var UserModel = mongoose.model('User');
        var ServerModel = mongoose.model('Server');

        var HitProvider = function () {};

        HitProvider.prototype.findAll = function (callback) {
            HitModel.find({}).populate('user server').exec(callback);
        };

        HitProvider.prototype.save = function (hit, callback) {
            ServerModel.findOrCreate(hit.server, function(err, server, created) {
                UserModel.findOrCreate({name: hit.user.name, server: server.id}, hit.user.additional, function(err, user, created) {
                    hit.server = server.id;
                    hit.user = user.id;

                    new HitModel(hit).save(function (err, hit) {
                        if (!err) {
                            if (_.isArray(server.hits)) {
                                server.hits.push(hit.id);
                            } else {
                                server.hits = [hit.id];
                            }

                            if (_.isArray(user.hits)) {
                                user.hits.push(hit.id);
                            } else {
                                user.hits = [hit.id];
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
                                    callback(err, hit);
                                }
                            );
                        } else {
                            callback(err, hit);
                        }
                    });
                });
            });
        };

        HitProvider.prototype.saveMultiple = function(hits, callback) {
            async.map(hits,
                function(hit, callback) {
                    HitProvider.prototype.save(hit, callback);
                }, function(err, hits) {
                    callback(err, hits);
                }
            );
        };

        HitProvider.prototype.screens = HitModel.screens;

        return new HitProvider();
    };
})();
