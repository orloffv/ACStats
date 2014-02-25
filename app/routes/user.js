(function () {
    "use strict";
    module.exports = function(app, mongoose, log) {
        var _          = require('underscore');

        var UserProvider = require('../data-providers/user')(mongoose, log);
        var errorHelper = require('mongoose-error-helper').errorHelper;
        var screen = require('screener').screen;
        var mapping = require('./../libs/mapping');

        var routes = {
            list: function(req, res) {
                return routes.listWithFilter({}, req, res);
            },
            listByServer: function(req, res) {
                return routes.listWithFilter({server: req.params.id}, req, res);
            },
            listByCompany: function(req, res) {
                return routes.listWithFilter({server: req.params.id, 'additional.companyId': req.params.companyId}, req, res);
            },
            get: function(req, res) {
                return UserProvider.getById(req.params.id, function(err, user) {
                    if (!user) {
                        res.statusCode = 404;

                        return res.send({ error: 'Not found' });
                    } else {
                        return res.send(screen(user, UserProvider.screens.model));
                    }
                });
            },
            listWithFilter: function(where, req, res) {
                return UserProvider.findAll(where, {query: req.query}, function(err, users) {
                    if (!err) {
                        return res.send(screen(users, UserProvider.screens.collection));
                    } else {
                        return errorHelper(err, res);
                    }
                });
            },
            listCompaniesByServer: function(req, res) {
                return UserProvider.findAllCompanies({server: req.params.id}, {query:req.query}, function(err, companies) {
                    if (!err) {
                        return res.send(mapping(companies, {id: '_id'}));
                    } else {
                        return errorHelper(err, res);
                    }
                });
            }
        };

        app.get('/api/users', routes.list);
        app.get('/api/users/:id', routes.get);
        app.get('/api/servers/:serverId/users/:id', routes.get);
        app.get('/api/servers/:id/users', routes.listByServer);
        app.get('/api/servers/:id/companies', routes.listCompaniesByServer);
        app.get('/api/servers/:id/companies/:companyId/users', routes.listByCompany);
    };
})();
