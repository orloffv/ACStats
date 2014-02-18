(function () {
    "use strict";
    module.exports = function(app, mongoose, log) {
        var _          = require('underscore');

        var StatisticProvider = require('../data-providers/statistic')(mongoose, log);
        var screen = require('screener').screen;
        var mapping = require('./../libs/mapping');
        var errorHelper = require('./../libs/error-helper')(log);

        var routes = {
            countUsersCompaniesByDate: function(req, res) {
                return StatisticProvider.countUsersCompaniesByDate({server: req.params.id}, {query:req.query}, function(err, statistics) {
                    if (!err) {
                        return res.send(screen(statistics, StatisticProvider.screens.models));
                    } else {
                        return errorHelper(err, res);
                    }
                });
            },
            allGroupByPartDate: function(req, res) {
                return StatisticProvider.findAllGroupByPartDate({server: req.params.id}, {query:req.query}, function(err, statistics) {
                    if (!err) {
                        return res.send(statistics);
                    } else {
                        return errorHelper(err, res);
                    }
                });
            },
            sessionTimingGroupByPartDate: function(req, res) {
                return StatisticProvider.findSessionTimingGroupByPartDate({server: req.params.id}, {query :req.query}, function(err, statistics) {
                    if (!err) {
                        return res.send(statistics);
                    } else {
                        return errorHelper(err, res);
                    }
                });
            },
            hitSlowestByDate: function(req, res) {
                return StatisticProvider.findHitSlowestByDate({server: req.params.id}, {query :req.query}, function(err, statistics) {
                    if (!err) {
                        return res.send(mapping(statistics, {url: '_id'}));
                    } else {
                        return errorHelper(err, res);
                    }
                });
            },
            eventPopularByDate: function(req, res) {
                return StatisticProvider.findEventPopularByDate({server: req.params.id}, {query :req.query}, function(err, statistics) {
                    if (!err) {
                        return res.send(mapping(statistics, {name: '_id'}));
                    } else {
                        return errorHelper(err, res);
                    }
                });
            },
            countActiveInAllUsersCompaniesByDate: function(req, res) {
                return StatisticProvider.countActiveInAllUsersCompaniesByDate({server: req.params.id}, {query:req.query}, function(err, statistics) {
                    if (!err) {
                        return res.send(screen(statistics, StatisticProvider.screens.models));
                    } else {
                        return errorHelper(err, res);
                    }
                });
            },
            usersActiveByHitsDate: function(req, res) {
                return StatisticProvider.findUsersActiveByHitsDate({server: req.params.id}, {query:req.query}, function(err, statistics) {
                    if (!err) {
                        return res.send(statistics);
                    } else {
                        return errorHelper(err, res);
                    }
                });
            }
        };

        app.get('/api/servers/:id/statistic/users_companies/count_by_date', routes.countUsersCompaniesByDate);
        app.get('/api/servers/:id/statistic/all/group_by_part_date', routes.allGroupByPartDate);
        app.get('/api/servers/:id/statistic/session/timing/group_by_part_date', routes.sessionTimingGroupByPartDate);
        app.get('/api/servers/:id/statistic/hit/slowest_by_date', routes.hitSlowestByDate);
        app.get('/api/servers/:id/statistic/event/popular_by_date', routes.eventPopularByDate);
        app.get('/api/servers/:id/statistic/users_companies/count_active_in_all_by_date', routes.countActiveInAllUsersCompaniesByDate);
        app.get('/api/servers/:id/statistic/users/group_by_hits_date', routes.usersActiveByHitsDate);

        //самые активные компании
    };
})();
