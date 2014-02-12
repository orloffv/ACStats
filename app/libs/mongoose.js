(function () {
    "use strict";

    var async = require('async'),
        _ = require('underscore');

    module.exports = function(mongoose, log, config) {
        var db = mongoose.connection;

        db.on('error', function(err) {
            log.error('connection error:', err.message);
            //mongoose.reconnectServer();
        });

        db.once('open', function() {
            log.debug('connection open');
            mongoose.reconnected = 0;
        });

        db.on('disconnected', function () {
            log.debug('connection disconnected');
            mongoose.connectServer();
        });

        mongoose.reconnected = 0;

        mongoose.connectServer = function(callback) {
            if (!mongoose.isConnected()) {
                mongoose.connect(
                    config.get('mongoose:uri'),
                    {
                        server: {
                            auto_reconnect: true,
                            poolSize: 5,
                            socketOptions: {
                                keepAlive: 1
                            }
                        }
                    },
                    callback);
            }
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

        mongoose.isConnected = function() {
            return mongoose.connection.readyState;
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
