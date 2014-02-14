(function () {
    "use strict";
    module.exports = function(mongoose, log) {
        var _   = require('underscore');
        var async = require('async');
        var moment = require('moment');
        var HitProvider = require('./hit')(mongoose, log);
        var EventProvider = require('./event')(mongoose, log);
        var SessionProvider = require('./session')(mongoose, log);
        var QueryHelper = require('./../libs/query-helper')(mongoose);

        var StatisticProvider = function () {};

        var screenModel = {
            sessions: true,
            events: true,
            hits: true
        };

        StatisticProvider.prototype = {
            findAllByDate: function(where, options, callback) {
                var toFind = {};

                _.each(['sessions', 'events', 'hits'], function(modelName) {
                    var dataProviderFind;
                    if  (modelName === 'events') {
                        dataProviderFind = EventProvider.count;
                    } else if (modelName === 'hits') {
                        dataProviderFind = HitProvider.count;
                    } else if (modelName === 'sessions') {
                        dataProviderFind = SessionProvider.count;
                    }

                    toFind[modelName] = function(cb) {
                        return dataProviderFind(QueryHelper.getWhere(where, options), cb);
                    };
                });

                async.parallel(toFind,
                    function(err, items) {
                        callback(err, items);
                    }
                );
            },
            findAllByDateGrouped: function(where, options, callback) {
                var toFind = {};

                _.each(['hits', 'events', 'sessions'], function(modelName) {
                    var dataProviderFind;
                    if  (modelName === 'events') {
                        dataProviderFind = EventProvider.countGrouped;
                    } else if (modelName === 'hits') {
                        dataProviderFind = HitProvider.countGrouped;
                    } else if (modelName === 'sessions') {
                        dataProviderFind = SessionProvider.countGrouped;
                    }

                    var parts = 7;
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
            findSessionTimingByDateGrouped: function(where, options, callback) {
                SessionProvider.getTimingByDateGrouped(QueryHelper.getWhere(where, options), callback);
            },
            screens: {
                models: screenModel
            }
        };

        return new StatisticProvider();
    };
})();
