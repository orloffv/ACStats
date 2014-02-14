(function () {
    "use strict";
    module.exports = function(mongoose, log) {
        var _          = require('underscore');
        var async      = require('async');
        var ServerModel = mongoose.model('Server');

        var ServerProvider = function () {};

        ServerProvider.prototype = {
            findAll: function (callback) {
                ServerModel.find({}).populate('user').exec(callback);
            },
            getById: function(id, callback) {
                ServerModel.findById(id).populate('user server').exec(callback);
            },
            findOrCreate: function(name, callback) {
                ServerModel.findOrCreate({name: name}, callback);
            },
            screens: ServerModel.screens
        };

        return new ServerProvider();
    };
})();
