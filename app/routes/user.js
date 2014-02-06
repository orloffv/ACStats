(function () {
    "use strict";
    module.exports = function(app, mongoose, log) {
        var _          = require('underscore');
        var UserModel = mongoose.model('User');
        var errorHelper = require('mongoose-error-helper').errorHelper;
        var screen = require('screener').screen;
        var mapping = require('./../libs/mapping');

        var routes = {
            list: function(req, res) {
                var filter = {};

                return UserModel.find(filter).populate('server').exec(function(err, users) {
                    if (!err) {
                        return res.send(screen(users, UserModel.screens.collection));
                    } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s', res.statusCode, err.message);
                        return res.send({ error: 'Server error' });
                    }
                });
            }
        };

        app.get('/api/users', routes.list);
    };
})();
