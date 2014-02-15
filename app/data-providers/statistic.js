(function () {
    "use strict";
    module.exports = function(mongoose, log) {
        var _   = require('underscore');
        var async = require('async');
        var moment = require('moment');
        var HitProvider = require('./hit')(mongoose, log);
        var EventProvider = require('./event')(mongoose, log);
        var SessionProvider = require('./session')(mongoose, log);
        var UserProvider = require('./user')(mongoose, log);
        var QueryHelper = require('./../libs/query-helper')(mongoose);

        var StatisticProvider = function () {};

        var screenModel = {
            sessions: true,
            events: true,
            hits: true,
            users_new: true,
            users_last_hit: true,
            companies: true,
            companies_new: true
        };

        StatisticProvider.prototype = {
            countAllByDate: function(where, options, callback) {
                var toFind = {};

                _.each(['sessions', 'events', 'hits', 'users_new', 'users_last_hit', 'companies', 'companies_new'], function(modelName) {
                    var dataProviderFind;
                    if  (modelName === 'events') {
                        dataProviderFind = EventProvider.count;
                    } else if (modelName === 'hits') {
                        dataProviderFind = HitProvider.count;
                    } else if (modelName === 'sessions') {
                        dataProviderFind = SessionProvider.count;
                    } else if (modelName === 'users_new') {
                        dataProviderFind = UserProvider.count;
                    } else if (modelName === 'users_last_hit') {
                        dataProviderFind = UserProvider.countByLastHit;
                    } else if (modelName === 'companies') {
                        dataProviderFind = UserProvider.countCompaniesByLastHit;
                    } else if (modelName === 'companies') {
                        dataProviderFind = UserProvider.countCompaniesByLastHit;
                    } else if (modelName === 'companies_new') {
                        dataProviderFind = UserProvider.countNewCompanies;
                    }

                    if (dataProviderFind) {
                        toFind[modelName] = function(cb) {
                            return dataProviderFind(QueryHelper.getWhere(where, options), cb);
                        };
                    }
                });

                async.parallel(toFind, callback);
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
                                _.map(result, function(item) {
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
            findSessionTimingGroupByDate: function(where, options, callback) {
                SessionProvider.getTimingGroupByDate(QueryHelper.getWhere(where, options), callback);
            },
            screens: {
                models: screenModel
            }
        };

        return new StatisticProvider();
    };
})();
