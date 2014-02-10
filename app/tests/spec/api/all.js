(function () {
    "use strict";
    var request = require('supertest');
    var _ = require('underscore');
    var assert = require('assert');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();

    var app = require('../../../app')(mongoose, 'testing');
    var exampleEvent = function(data) {
        data = data || {};

        return _.extend({
            "name": "Create message",
            "additional": {
                "size": 3,
                "who": "HRD",
                "recipients": 3
            },
            "user": {
                "name": "test@example.com",
                "additional": {
                    "companyId": "123",
                    "userId": "123"
                }
            },
            "server": {
                "name": "development"
            }
        }, data);
    };

    var exampleHit = function(data) {
        data = data || {};

        return _.extend({
            "url": "http://yandex.ru/pogoda",
            "additional": {
                "size": 3,
                "who": "HRD",
                "recipients": 3
            },
            "user": {
                "name": "test@example.com",
                "additional": {
                    "companyId": "123",
                    "userId": "123"
                }
            },
            "server": {
                "name": "development"
            }
        }, data);
    };


    before(function(done) {
        mongoose.connect(app.get('config').get('mongoose:uri'), done);
    });

    after(function(done) {
        mongoose.dropAllCollections(function() {
            mongoose.disconnect(done);
        });
    });

    describe('API All', function() {
        beforeEach(function(done) {
            mongoose.dropAllCollections(done);
        });

        afterEach(function(done) {
            done();
        });

        it('POST /api/all should successfully save 1 event & 1 hit', function (done) {
            request(app)
                .post('/api/all')
                .send({
                    events: [
                        exampleEvent()
                    ],
                    hits: [
                        exampleHit()
                    ]
                })
                .expect(201)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    assert(res.body.events.length === 1);
                    assert(res.body.hits.length === 1);
                    assert(res.body.events[0].id);
                    assert(res.body.hits[0].id);

                    done();
                });
        });

        it('POST /api/all should successfully save 5 events & 4 hits', function (done) {
            request(app)
                .post('/api/all')
                .send({
                    events: [
                        exampleEvent(),
                        exampleEvent(),
                        exampleEvent(),
                        exampleEvent(),
                        exampleEvent()
                    ],
                    hits: [
                        exampleHit(),
                        exampleHit(),
                        exampleHit(),
                        exampleHit()
                    ]
                })
                .expect(201)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    assert(res.body.events.length === 5);
                    assert(res.body.hits.length === 4);
                    assert(res.body.events[0].id);
                    assert(res.body.hits[0].id);

                    request(app)
                        .get('/api/users')
                        .expect(200)
                        .end(function(err, res) {
                            if (err) {
                                return done(err);
                            }

                            assert(res.body.length === 1);
                            done();
                        });
                });
        });
    });

    process.on('exit', function () {
        mongoose.disconnect();
    });
})();
