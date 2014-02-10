(function () {
    "use strict";
    module.exports = function(mongoose, log) {
        var _          = require('underscore');
        var async      = require('async');
        var validate = require('jsonschema').validate;
        var HitProvider = require('./hit')(mongoose, log);
        var EventProvider = require('./event')(mongoose, log);
        var SessionProvider = require('./session')(mongoose, log);

        var AllProvider = function () {};

        AllProvider.prototype.saveMultiple = function(data, callback) {
            var toSave = {};

            if (!_.size(data) || !_.isObject(data)) {
                return callback({name: 'Empty'});
            }

            _.each(data, function(items, modelName) {
                if (_.size(items)) {
                    toSave[modelName] = [];
                    _.each(items, function(item) {
                        toSave[modelName].push(
                            function(cb) {
                                var dataProviderSave;
                                if  (modelName === 'events') {
                                    dataProviderSave = EventProvider.save;
                                } else if (modelName === 'hits') {
                                    dataProviderSave = HitProvider.save;
                                } else if (modelName === 'sessions') {
                                    dataProviderSave = SessionProvider.save;
                                }

                                return dataProviderSave(item, cb);
                            }
                        );
                    });
                }
            });

            if (!_.size(toSave)) {
                return callback({name: 'Empty'});
            }

            var toSaveWrapper = [];

            _.each(toSave, function(items, modelName) {
                toSaveWrapper.push(
                    function(cb) {
                        return async.series(items,
                            function(err, items) {
                                cb(err, items, modelName);
                            }
                        );
                    }
                );
            });

            var parseData = function(err, data) {
                var parseData = {};
                if (_.isArray(data) && _.size(data)) {
                    _.each(data, function(items) {
                        parseData[items[1]] = items[0];
                    });
                }

                return callback(err, parseData);
            };

            async.series(toSaveWrapper,
                function(err, items) {
                    parseData(err, items);
                }
            );
        };

        AllProvider.prototype.screens = {
            postCollection: {
                events: [
                    {
                        id: true
                    }
                ],
                hits: [
                    {
                        id: true
                    }
                ],
                sessions: [
                    {
                        id: true
                    }
                ]
            }
        };

        return new AllProvider();
    };
})();
