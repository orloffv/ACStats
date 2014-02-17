(function () {
    "use strict";
    module.exports = function(mongoose, log) {
        var _          = require('underscore');
        var async      = require('async');
        var UserModel = mongoose.model('User');

        var UserProvider = function () {};

        UserProvider.prototype = {
            findAll: function (where, callback) {
                UserModel.find(where).populate('server').exec(callback);
            },
            getById: function(id, callback) {
                UserModel.findById(id).populate('user server').exec(callback);
            },
            findOrCreate: function(name, serverId, updateOptions, callback) {
                UserModel.findOrCreate({name: name, server: serverId}, updateOptions, callback);
            },
            count: function(where, callback) {
                UserModel.count(where, callback);
            },
            countAll: function(where, callback) {
                if (where.createdAt) {
                    delete where.createdAt;
                }

                UserModel.count(where, callback);
            },
            countAllCompanies: function(where, callback) {
                if (where.createdAt) {
                    delete where.createdAt;
                }

                where.additional = {$gt:{}};
                where['additional.companyId'] = {$gte: ""};

                UserModel.distinct('additional.companyId', where, function(err, result) {
                    var count = 0;
                    if (!err) {
                        count = result.length;
                    }

                    callback(err, count);
                });
            },
            countByLastHit: function(where, callback) {
                if (where.createdAt) {
                    where.lastHitAt = where.createdAt;
                    delete where.createdAt;
                }

                UserModel.count(where, callback);
            },
            countCompaniesByLastHit: function(where, callback) {
                if (where.createdAt) {
                    where.lastHitAt = where.createdAt;
                    delete where.createdAt;
                }

                where.additional = {$gt:{}};
                where['additional.companyId'] = {$gte: ""};

                UserModel.distinct('additional.companyId', where, function(err, result) {
                    var count = 0;
                    if (!err) {
                        count = result.length;
                    }

                    callback(err, count);
                });
            },
            countNewCompanies: function(where, callback) {
                UserModel.countNewCompanies(where, function(err, result) {
                    var count = 0;
                    if (!err) {
                        count = _.chain(result).
                            filter(function(item) {
                                return item.value;
                            }).
                            size().
                            value();
                    }
                    callback(err, count);
                });
            },
            screens: UserModel.screens
        };

        return new UserProvider();
    };
})();
