(function () {
    "use strict";
    module.exports = function(mongoose, log) {
        var _   = require('underscore');
        var async = require('async');
        var moment = require('moment');
        var validate = require('jsonschema').validate;
        var HitProvider = require('./hit')(mongoose, log);
        var EventProvider = require('./event')(mongoose, log);
        var SessionProvider = require('./session')(mongoose, log);
        var dateHelper = require('./../libs/date-helper')();

        var StatisticProvider = function () {};

        var getWhere = function(where) {
            var whereExpressions = {};

            _.each(where, function(value, key) {
                if (key === 'user' || key === 'server') {
                    whereExpressions[key] = mongoose.Types.ObjectId(value);
                }
            });

            if (where.from && where.to) {
                whereExpressions.createdAt = {
                    $gte: moment(where.from, "DD-MM-YYYY")._d,
                    $lt: moment(where.to + ' 23:59:59', "DD-MM-YYYY HH:mm:ss")._d
                };
            }

            return whereExpressions;
        };

        StatisticProvider.prototype.findAllByDate = function(where, callback) {
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
                    return dataProviderFind(getWhere(where), cb);
                };
            });

            async.series(toFind,
                function(err, items) {
                    callback(err, items);
                }
            );
        };

        StatisticProvider.prototype.findAllByDateGrouped = function(where, callback) {
            var toFind = {};

            _.each(['hits'], function(modelName) {
                var dataProviderFind;
                if  (modelName === 'events') {
                    dataProviderFind = EventProvider.countGrouped;
                } else if (modelName === 'hits') {
                    dataProviderFind = HitProvider.countGrouped;
                } else if (modelName === 'sessions') {
                    dataProviderFind = SessionProvider.countGrouped;
                }

                toFind[modelName] = function(cb) {
                    return dataProviderFind(getWhere(where), 7, cb);
                };
            });

            async.series(toFind,
                function(err, items) {
                    console.info(JSON.stringify(items));
                    callback(err, items);
                }
            );
        };

        var screenModel = {
            sessions: true,
            events: true,
            hits: true
        };

        StatisticProvider.prototype.screens = {
            models: screenModel,
            collection: [
                screenModel
            ]
        };

        return new StatisticProvider();
    };
})();
