(function () {
    "use strict";
    module.exports = function(app, mongoose, log) {
        var _          = require('underscore');
        var ServerModel = mongoose.model('Server');
        var errorHelper = require('mongoose-error-helper').errorHelper;
        var screen = require('screener').screen;
        var mapping = require('./../libs/mapping');

        var routes = {
            list: function(req, res) {
                var filter = {};

                return ServerModel.find(filter).exec(function(err, servers) {
                    if (!err) {
                        return res.send(screen(servers, ServerModel.screens.collection));
                    } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s', res.statusCode, err.message);
                        return res.send({ error: 'Server error' });
                    }
                });
            }
        };

        app.get('/api/servers', routes.list);
    };
})();
