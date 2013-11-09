(function () {
    "use strict";
    var mongoose    = require('mongoose');
    var log         = require('./log')(module);
    var config      = require('./config');
    var modelsEvent = require('../models/event');

    module.exports.EventModel = modelsEvent;
    module.exports.connect = function(uri, callback) {
        if (typeof uri === 'function') {
            callback = uri;
            uri = null;
        }

        mongoose.connect(uri || config.get('mongoose:uri'), callback);
        var db = mongoose.connection;

        db.on('error', function (err) {
            log.error('connection error:', err.message);
            process.exit(1);
        });
        db.once('open', function callback () {});
    };

    module.exports.disconnect = function(callback) {
        mongoose.disconnect(callback);
    };
})();
