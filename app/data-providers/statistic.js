(function () {
    "use strict";
    module.exports = function(mongoose, log) {
        var _   = require('underscore');
        var async = require('async');
        var HitProvider = require('./hit')(mongoose, log);
        var EventProvider = require('./event')(mongoose, log);
        var SessionProvider = require('./session')(mongoose, log);
        var UserProvider = require('./user')(mongoose, log);
        var QueryHelper = require('./../libs/query-helper')(mongoose);
        var UserModel = mongoose.model('User');

        var StatisticProvider = function () {};

        var screenModel = {
            users_new: true,
            users_last_hit: true,
            companies: true,
            companies_new: true,
            companies_last_hit: true,
            users: true
        };

        StatisticProvider.prototype = {
            countActiveInAllUsersCompaniesByDate: function(where, options, callback) {
                async.parallel({
                    actveUserIds: function(cb) {
                        UserProvider.findUserIdsActive(QueryHelper.getWhere(where, options), cb);
                    },
                    users: function(cb) {
                        UserProvider.countAll(QueryHelper.getWhere(where, options), cb);
                    },
                    companies: function(cb) {
                        UserProvider.countAllCompanies(QueryHelper.getWhere(where, options), cb);
                    }
                }, function(err, result) {
                    if (err) {
                        callback(err, null);
                    } else {
                        UserModel.find({_id: {$in: result.actveUserIds}}, 'additional.companyId', function(err, userResult) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(err, {
                                    users: result.users,
                                    companies: result.companies,
                                    users_last_hit: _.size(result.actveUserIds),
                                    companies_last_hit: _.size(
                                        _.union(
                                            _.map(userResult, function(user) {
                                                return user.additional.companyId;
                                            })
                                        )
                                    )
                                });
                            }
                        });
                    }
                });
            },
            countUsersCompaniesByDate: function(where, options, callback) {
                async.parallel({
                    actveUserIds: function(cb) {
                        UserProvider.findUserIdsActive(QueryHelper.getWhere(where, options), cb);
                    },
                    users_new: function(cb) {
                        UserProvider.count(QueryHelper.getWhere(where, options), cb);
                    },
                    companies_new: function(cb) {
                        UserProvider.countNewCompanies(QueryHelper.getWhere(where, options), cb);
                    }
                }, function(err, result) {
                    if (err) {
                        callback(err, null);
                    } else {
                        UserModel.find({_id: {$in: result.actveUserIds}}, 'additional.companyId', function(err, userResult) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(err, {
                                    users_new: result.users_new,
                                    companies_new: result.companies_new,
                                    users: _.size(result.actveUserIds),
                                    companies: _.size(
                                        _.union(
                                            _.map(userResult, function(user) {
                                                return user.additional.companyId;
                                            })
                                        )
                                    )
                                });
                            }
                        });
                    }
                });
            },
            findAllGroupByPartDate: function(where, options, callback) {
                var parts = options.query.parts || 7;
                var toFind = {};

                _.each(['hits', 'events', 'sessions'], function(modelName) {
                    var dataProviderFind;
                    if  (modelName === 'events') {
                        dataProviderFind = EventProvider.countGroupByPartDate;
                    } else if (modelName === 'hits') {
                        dataProviderFind = HitProvider.countGroupByPartDate;
                    } else if (modelName === 'sessions') {
                        dataProviderFind = SessionProvider.countGroupByPartDate;
                    }

                    toFind[modelName] = function(cb) {
                        return dataProviderFind(QueryHelper.getWhere(where, options), parts, function(err, result) {
                            var returnResult = {};
                            if (!err) {
                                _.each(result, function(item) {
                                    returnResult[item._id] = item.value;
                                });

                                _(parts).times(function(key) {
                                    if (!returnResult[key + 1]) {
                                        returnResult[key + 1] = 0;
                                    }
                                });
                            } else {
                                returnResult = result;
                            }

                            cb(err, returnResult);
                        });
                    };
                });

                async.parallel(toFind, callback);
            },
            findSessionTimingGroupByPartDate: function(where, options, callback) {
                var parts = options.query.parts || 7;
                SessionProvider.getTimingGroupByPartDate(QueryHelper.getWhere(where, options), parts, function(err, result) {
                    var returnResult = {};
                    if (!err) {
                        _.each(result, function(item) {
                            returnResult[item._id] = item.value;
                        });

                        _(parts).times(function(key) {
                            if (!returnResult[key + 1]) {
                                returnResult[key + 1] = null;
                            }
                        });
                    } else {
                        returnResult = result;
                    }

                    callback(err, returnResult);
                });
            },
            findHitSlowestByDate: function(where, options, callback) {
                HitProvider.findHitSlowestByDate(QueryHelper.getWhere(where, options), QueryHelper.getLimit(options), callback);
            },
            findEventPopularByDate: function(where, options, callback) {
                EventProvider.findEventPopularByDate(QueryHelper.getWhere(where, options), QueryHelper.getLimit(options), callback);
            },
            findUsersActiveByHitsDate: function(where, options, callback) {
                UserProvider.findUsersActiveByHitsDate(QueryHelper.getWhere(where, options), QueryHelper.getLimit(options), callback);
            },
            finUserUserAgents: function(where, options, callback) {
                SessionProvider.finUserUserAgents(QueryHelper.getWhere(where, options), QueryHelper.getLimit(options), callback);
            },
            countBrowsers: function(where, options, callback) {
                SessionProvider.findBrowsers(QueryHelper.getOptions(where, options), callback);
            },
            countCities: function(where, options, callback) {
                SessionProvider.findCities(QueryHelper.getOptions(where, options), callback);
            },
            screens: {
                models: screenModel
            }
        };

        return new StatisticProvider();
    };
})();
