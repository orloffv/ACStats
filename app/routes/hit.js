(function () {
    "use strict";
    module.exports = function(app, mongoose, log) {
        var _          = require('underscore');
        var HitModel = mongoose.model('Hit');
        var UserModel = mongoose.model('User');
        var ServerModel = mongoose.model('Server');
        var errorHelper = require('mongoose-error-helper').errorHelper;
        var screen = require('screener').screen;
        var mapping = require('./../libs/mapping');

        var routes = {
            list: function(req, res) {
                var filter = {};

                return HitModel.find(filter).populate('user server').exec(function(err, hits) {
                    if (!err) {
                        return res.send(screen(hits, HitModel.screens.collection));
                    } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s', res.statusCode, err.message);
                        return res.send({ error: 'Server error' });
                    }
                });
            },
            post: function(req, res) {
                var hits = [];

                if (_.isArray(req.body)) {
                    hits = _.map(req.body, function(object) {
                        return object;
                    });
                } else {
                    hits = [req.body];
                }

                if (_.size(hits)) {
                    _.each(hits, function(hit) {
                        ServerModel.findOrCreate(hit.server, function(err, server, created) {

                            UserModel.findOrCreate({name: hit.user.name, server: server.id}, hit.user.additional, function(err, user, created) {
                                hit.server = server.id;
                                hit.user = user.id;

                                new HitModel(hit).save(function (err, hit) {
                                    res.statusCode = 201;
                                    return res.send(screen(hit, HitModel.screens.postModel));
                                });
                            });
                        });
                    });
                } else {
                    res.statusCode = 400;
                    if (!_.size(hits)) {
                        res.send({ error: 'Empty request' });
                    } else {
                        return res.send({ error: 'Server error' });
                    }
                }
            }
        };

        app.get('/api/hits', routes.list);
        app.post('/api/hits', routes.post);
    };
})();
