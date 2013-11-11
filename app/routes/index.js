(function () {
    "use strict";
    module.exports = function(app, mongoose, log) {
        var routes = {
            index: function(req, res) {
                res.send('see /api/events');
            }
        };

        app.get('/', routes.index);
    };
})();
