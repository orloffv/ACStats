(function () {
    "use strict";

    var _ = require('underscore');

    module.exports = function(app, mongoose, log) {
        var ServerProvider = require('../data-providers/server')(mongoose, log);
        var errorHelper = require('mongoose-error-helper').errorHelper;

        var routes = {
            index: function(req, res) {
                var routes = [];
                if (app.routes && app.routes.get) {
                    routes = _.map(app.routes.get, function(route) {
                        return route.path;
                    });
                }

                res.send('see<br> ' + _.reduce(routes, function(memo, route) {return memo + route + '<br>';}));
            },
            ping: function(req, res) {
                res.send({msg: 'pong'});
            },
            pingMongo: function(req, res) {
                ServerProvider.findFirstServer(function(err, response) {
                    if (!err) {
                        return res.send({msg: 'pong'});
                    } else {
                        return errorHelper(err, res);
                    }
                });
            }
        };

        app.get('/', routes.index);
        app.get('/ping', routes.ping);
        app.get('/ping_mongo', routes.pingMongo);
    };
})();
