(function () {
    "use strict";
    module.exports = function(mongoose, log) {
        var _          = require('underscore');
        var async      = require('async');
        var ServerModel = mongoose.model('Server');

        var ServerProvider = function () {};

        ServerProvider.prototype.findAll = function (callback) {
            ServerModel.find({}).populate('user').exec(callback);
        };

        ServerProvider.prototype.screens = ServerModel.screens;

        return new ServerProvider();
    };
})();
