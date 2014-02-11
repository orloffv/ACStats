(function () {
    "use strict";

    var async = require('async'),
        _ = require('underscore');

    module.exports = function(mongoose, log, config) {
        var db = mongoose.connection;

        db.on('error', function (err) {
            log.error('connection error:', err.message);
            mongoose.reconnectServer();
        });

        db.once('open', function callback () {
            mongoose.reconnected = 0;
        });

        mongoose.reconnected = 0;

        mongoose.connectServer = function(callback) {
            mongoose.connect(config.get('mongoose:uri'), {server:{auto_reconnect:true}}, callback);
        };

        mongoose.disconnectServer = function(callback) {
            mongoose.disconnect(callback);
        };

        mongoose.reconnectServer = function(callback) {
            mongoose.reconnected++;
            if (mongoose.reconnected <= 5) {
                mongoose.disconnect(mongoose.connectServer(callback));
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
