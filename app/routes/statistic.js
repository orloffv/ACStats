(function () {
    "use strict";
    module.exports = function(app, mongoose, log) {
        var _          = require('underscore');

        var StatisticProvider = require('../data-providers/statistic')(mongoose, log);
        var screen = require('screener').screen;
        var mapping = require('./../libs/mapping');
        var errorHelper = require('./../libs/error-helper')(log);

        var routes = {
            allByDate: function(req, res) {
                var where = {server: req.params.id, from: req.query.from, to: req.query.to};
                return StatisticProvider.findAllByDate(where, function(err, statistics) {
                    if (!err) {
                        return res.send(screen(statistics, StatisticProvider.screens.models));
                    } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s', res.statusCode, err.message);

                        return res.send({ error: 'Server error' });
                    }
                });
            },
            allByDateGrouped: function(req, res) {
                var where = {server: req.params.id, from: req.query.from, to: req.query.to};
                return StatisticProvider.findAllByDateGrouped(where, function(err, statistics) {
                    if (!err) {
                        return res.send(screen(statistics, StatisticProvider.screens.models));
                    } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s', res.statusCode, err.message);

                        return res.send({ error: 'Server error' });
                    }
                });
            }
        };

        app.get('/api/servers/:id/statistic/all/by_date', routes.allByDate);
        app.get('/api/servers/:id/statistic/all/by_date/grouped', routes.allByDateGrouped);
    };
})();
