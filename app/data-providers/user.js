(function () {
    "use strict";
    module.exports = function(mongoose, log) {
        var _          = require('underscore');
        var async      = require('async');
        var UserModel = mongoose.model('User');

        var UserProvider = function () {};

        UserProvider.prototype = {
            findAll: function (where, callback) {
                UserModel.find(where).populate('server').exec(callback);
            },
            getById: function(id, callback) {
                UserModel.findById(id).populate('user server').exec(callback);
            },
            findOrCreate: function(name, serverId, updateOptions, callback) {
                UserModel.findOrCreate({name: name, server: serverId}, updateOptions, callback);
            },
            screens: UserModel.screens
        };

        return new UserProvider();
    };
})();
