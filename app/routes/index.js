(function () {
    "use strict";

    var _ = require('underscore');

    module.exports = function(app, mongoose, log) {
        var routes = {
            index: function(req, res) {
                var routes = [];
                if (app.routes && app.routes.get) {
                    routes = _.map(app.routes.get, function(route) {
                        return route.path;
                    });
                }

                res.send('see<br> ' + _.reduce(routes, function(memo, route) {return memo + route + '<br>';}));
            }
        };

        app.get('/', routes.index);
    };
})();
