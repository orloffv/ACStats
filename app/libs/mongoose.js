(function () {
    "use strict";
    module.exports = function(mongoose) {
        var log         = require('./log')(module);
        var config      = require('./config');
        var modelsEvent = require('../models/event')(mongoose);

        return {
            EventModel: modelsEvent,
            connect: function(callback) {
                mongoose.connect(config.get('mongoose:uri'), callback);
                var db = mongoose.connection;

                db.on('error', function (err) {
                    log.error('connection error:', err.message);
                    process.exit(1);
                });
                db.once('open', function callback () {});
            },
            disconnect: function(callback) {
                mongoose.disconnect(callback);
            }
        };
    };
})();
