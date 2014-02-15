(function () {
    "use strict";
    module.exports = function(app, mongoose, log) {
        var _          = require('underscore');

        var StatisticProvider = require('../data-providers/statistic')(mongoose, log);
        var screen = require('screener').screen;
        var mapping = require('./../libs/mapping');
        var errorHelper = require('./../libs/error-helper')(log);

        var routes = {
            countAllByDate: function(req, res) {
                return StatisticProvider.countAllByDate({server: req.params.id}, {query:req.query}, function(err, statistics) {
                    if (!err) {
                        return res.send(screen(statistics, StatisticProvider.screens.models));
                    } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s', res.statusCode, err.message);

                        return res.send({ error: 'Server error' });
                    }
                });
            },
            allGroupByPartDate: function(req, res) {
                return StatisticProvider.findAllGroupByPartDate({server: req.params.id}, {query:req.query}, function(err, statistics) {
                    if (!err) {
                        return res.send(screen(statistics, StatisticProvider.screens.models));
                    } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s', res.statusCode, err.message);

                        return res.send({ error: 'Server error' });
                    }
                });
            },
            sessionTimingGroupByDate: function(req, res) {
                return StatisticProvider.findSessionTimingGroupByDate({server: req.params.id}, {query:req.query}, function(err, statistics) {
                    if (!err) {
                        return res.send(mapping(statistics, {date: '_id', timings: 'value'}));
                    } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s', res.statusCode, err.message);

                        return res.send({ error: 'Server error' });
                    }
                });
            },
            hitSlowestByDate: function(req, res) {
                return StatisticProvider.findHitSlowestByDate({server: req.params.id}, {query:req.query}, function(err, statistics) {
                    if (!err) {
                        return res.send(mapping(statistics, {url: '_id'}));
                    } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s', res.statusCode, err.message);

                        return res.send({ error: 'Server error' });
                    }
                });
            }
        };

        app.get('/api/servers/:id/statistic/all/count_by_date', routes.countAllByDate);
        app.get('/api/servers/:id/statistic/all/group_by_part_date', routes.allGroupByPartDate);
        app.get('/api/servers/:id/statistic/session/timing/group_by_date', routes.sessionTimingGroupByDate);
        app.get('/api/servers/:id/statistic/hits/slowest_by_date', routes.hitSlowestByDate)
    };
})();
