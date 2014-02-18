(function () {
    "use strict";

    var async = require('async'),
        _ = require('underscore');

    var strpos = function(haystack, needle, offset) {
        var i = (haystack + '').indexOf(needle, (offset || 0));
        return i === -1 ? false : i;
    };

    module.exports = function(mongoose, log, config) {
        var db = mongoose.connection;

        db.on('error', function(err) {
            if (strpos(err.message, 'timed out') !== null) {
                return false;
            }

            if (strpos(err.message, 'failed to connect') !== null) {
                log.debug('MongoDB: error - ', err.message);
            } else {
                log.error('MongoDB: error - ', err.message);
            }
        });

        db.on('connecting', function() {
            log.debug('MongoDB: connecting');
        });

        db.on('connected', function() {
            log.debug('MongoDB: connected');
        });

        db.on('disconnecting', function() {
            log.debug('MongoDB: disconnecting');
        });

        db.on('reconnected', function() {
            log.debug('MongoDB: reconnected');
        });

        db.on('open', function() {
            log.debug('MongoDB: connection open');
            mongoose.reconnected = 0;
            mongoose.connected = 1;
        });

        db.on('close', function() {
            log.debug('MongoDB: connection close');
        });

        db.on('disconnected', function () {
            log.debug('MongoDB: disconnected');
            if (!mongoose.connected) {
                process.exit(1);
            }
            //mongoose.connectServer();
        });

        mongoose.reconnected = 0;
        mongoose.connected = 0;

        mongoose.connectServer = function(callback) {
            mongoose.connect(
                config.get('mongoose:uri'),
                {
                    server: {
                        auto_reconnect: true,
                        poolSize: 5,
                        socketOptions: {
                            keepAlive: 1,
                            connectTimeoutMS: 1000,
                            socketTimeoutMS: 1000*60*3
                        }
                    }
                },
                callback);
        };

        mongoose.disconnectServer = function(callback) {
            mongoose.disconnect(callback);
        };

        mongoose.reconnectServer = function(callback) {
            mongoose.reconnected++;
            if (mongoose.reconnected <= 5) {
                mongoose.disconnectServer(mongoose.connectServer(callback));
            } else {
                mongoose.disconnectServer(
                    function() {
                        process.exit(1);
                    }
                );
            }
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
        require('../models/session')(mongoose);

        return mongoose;
    };
})();
