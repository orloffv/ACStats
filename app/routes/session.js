(function () {
    "use strict";
    module.exports = function(app, mongoose, log) {
        var _          = require('underscore');
        var SessionModel = mongoose.model('Session');
        var UserModel = mongoose.model('User');
        var ServerModel = mongoose.model('Server');
        var errorHelper = require('mongoose-error-helper').errorHelper;
        var screen = require('screener').screen;
        var mapping = require('./../libs/mapping');

        var routes = {
            list: function(req, res) {
                var filter = {};

                return SessionModel.find(filter).populate('user server').exec(function(err, sessions) {
                    if (!err) {
                        return res.send(screen(sessions, SessionModel.screens.collection));
                    } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s', res.statusCode, err.message);
                        return res.send({ error: 'Server error' });
                    }
                });
            },
            post: function(req, res) {
                var sessions = [];

                if (_.isArray(req.body)) {
                    sessions = _.map(req.body, function(object) {
                        return object;
                    });
                } else {
                    sessions = [req.body];
                }

                if (_.size(sessions)) {
                    _.each(sessions, function(session) {
                        ServerModel.findOrCreate(session.server, function(err, server, created) {

                            UserModel.findOrCreate({name: session.user.name, server: server.id}, session.user.additional, function(err, user, created) {
                                session.server = server.id;
                                session.user = user.id;

                                new SessionModel(session).save(function (err, session) {
                                    res.statusCode = 201;
                                    return res.send(screen(session, SessionModel.screens.postModel));
                                });
                            });
                        });
                    });
                } else {
                    res.statusCode = 400;
                    if (!_.size(sessions)) {
                        res.send({ error: 'Empty request' });
                    } else {
                        return res.send({ error: 'Server error' });
                    }
                }
            }
        };

        app.get('/api/sessions', routes.list);
        app.post('/api/sessions', routes.post);
    };
})();
