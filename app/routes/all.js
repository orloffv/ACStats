(function () {
    "use strict";
    module.exports = function(app, mongoose, log) {
        var _          = require('underscore');

        var AllProvider = require('../data-providers/all')(mongoose, log);
        var screen = require('screener').screen;
        var mapping = require('./../libs/mapping');
        var errorHelper = require('./../libs/error-helper')(log);

        var routes = {
            post: function(req, res) {
                AllProvider.saveMultiple(req.body, function(err, items) {
                    if (!err) {
                        res.statusCode = 201;
                        return res.send(screen(items, AllProvider.screens.postCollection));
                    } else {
                        return errorHelper(err, res);
                    }
                }, {
                    useragent: req.useragent,
                    ip: req.ip
                });
            }
        };

        app.post('/api/all', routes.post);
    };
})();
