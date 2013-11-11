(function () {
    "use strict";
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

        require('../models/event')(mongoose);

        return mongoose;
    };
})();
