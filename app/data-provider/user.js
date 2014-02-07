(function () {
    "use strict";
    module.exports = function(mongoose, log) {
        var _          = require('underscore');
        var async      = require('async');
        var UserModel = mongoose.model('User');

        var UserProvider = function () {};

        UserProvider.prototype.findAll = function (where, callback) {
            UserModel.find(where).populate('server').exec(callback);
        };

        UserProvider.prototype.getById = function(id, callback) {
            UserModel.findById(id).populate('user server').exec(callback);
        };

        UserProvider.prototype.screens = UserModel.screens;

        return new UserProvider();
    };
})();
