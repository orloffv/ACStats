(function () {
    "use strict";

    var async = require('async'),
        _ = require('underscore');

    module.exports = function(mongoose, log, config) {
        mongoose.connectServer = function(callback) {
            mongoose.connect(config.get('mongoose:uri'), callback);
            var db = mongoose.connection;

            db.on('error', function (err) {
                log.error('connection error:', err.message);
                process.exit(1);
            });
            db.once('open', function callback () {});
        };

        mongoose.disconnectServer = function(callback) {
            mongoose.disconnect(callback);
        };

        mongoose.dropAllCollections = function(callback) {
            var collections = _.keys(mongoose.connection.collections);
            async.forEach(collections, function(collectionName, done) {
                var collection = mongoose.connection.collections[collectionName];
                collection.drop(function(err) {
                    if (err && err.message !== 'ns not found') {
                        done(err);
                    }

                    done(null);
                });

            }, callback);
        };

        require('../models/event')(mongoose);
        require('../models/server')(mongoose);
        require('../models/user')(mongoose);
        require('../models/hit')(mongoose);

        return mongoose;
    };
})();
