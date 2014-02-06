(function () {
    "use strict";
    module.exports = function(app, mongoose, log) {
        var routes = {
            index: function(req, res) {
                res.send('see /api/events, /api/users, /api/servers, /api/hits');
            }
        };

        app.get('/', routes.index);
    };
})();
