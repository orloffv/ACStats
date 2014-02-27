(function () {
    "use strict";
    module.exports = function(mongoose, log) {
        var _          = require('underscore');
        var async      = require('async');
        var UserModel = mongoose.model('User');
        var HitModel = mongoose.model('Hit');
        var EventModel = mongoose.model('Event');
        var QueryHelper = require('./../libs/query-helper')(mongoose);

        var UserProvider = function () {};

        UserProvider.prototype = {
            findAll: function(where, options, callback) {
                var queryOptions = QueryHelper.getOptions(where, options);
                UserModel.find(queryOptions.where, null, {sort: queryOptions.sort}, callback);
            },
            findByEventHash: function(where, options, callback) {
                EventModel.findAllWithGroupByUser(QueryHelper.getWhere(where, options), function(err, eventResult) {
                    if (!err) {
                        UserModel.find({_id: {$in: _.pluck(eventResult, '_id')}}, function(err, userResult) {
                            var result = [];
                            if (!err) {
                                result = _.map(userResult, function(item) {
                                    var currentUser = _.find(eventResult, function(event) {
                                        return _.isEqual(event._id, item._id);
                                    });

                                    item.events = currentUser.count;
                                    item.lastAt = currentUser.lastAt;
                                    item.firstAt = currentUser.firstAt;

                                    return item;
                                });
                            }

                            result = _.sortBy(result, function(item) {
                                return -item.events;
                            });

                            callback(err, result);
                        });
                    } else {
                        callback(err, eventResult);
                    }
                });
            },
            getById: function(id, callback) {
                UserModel.findById(id).exec(callback);
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

                where['additional.companyId'] = {$exists: true};

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

                where['additional.companyId'] = {$exists: true};

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
            findUserIdsActive: function(where, callback) {
                async.parallel({
                    hits: function(cb) {
                        HitModel.distinct('user', where, cb);
                    },
                    events: function(cb) {
                        EventModel.distinct('user', where, cb);
                    }
                }, function(err, result) {
                    if (err) {
                        callback(err, null);
                    } else {
                        var userIds = _.union(_.map(result.hits, function(hit) {return hit.toString();}), _.map(result.events, function(event) {return event.toString();}));
                        callback(err, userIds);
                    }
                });
            },
            findUsersActiveByHitsDate: function(where, limit, callback) {
                HitModel.findActiveUsers(where, limit, function(err, hitResult) {
                    if (!err) {
                        UserModel.find({_id: {$in: _.pluck(hitResult, '_id')}}, function(err, userResult) {
                            var result = [];
                            if (!err) {
                                result = _.map(userResult, function(item) {
                                    var currentHits = _.find(hitResult, function(hit) {
                                        return _.isEqual(hit._id, item._id);
                                    });
                                    item = item.toObject();
                                    item.currentHits = currentHits.count;

                                    return item;
                                });
                            }

                            result = _.sortBy(result, function(item) {
                                return -item.currentHits;
                            });

                            callback(err, result);
                        });
                    } else {
                        callback(err, hitResult);
                    }
                });
            },
            findAllCompanies: function(where, options, callback) {
                UserModel.findAllCompanies(QueryHelper.getOptions(where, options), callback);
            },
            screens: UserModel.screens
        };

        return new UserProvider();
    };
})();
