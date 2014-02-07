(function () {
    "use strict";
    module.exports = function(mongoose, log) {
        var _          = require('underscore');
        var async      = require('async');
        var UserModel = mongoose.model('User');

        var UserProvider = function () {};

        UserProvider.prototype.findAll = function (callback) {
            UserModel.find({}).populate('server').exec(callback);
        };

        UserProvider.prototype.screens = UserModel.screens;

        return new UserProvider();
    };
})();
