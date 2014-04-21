(function () {
    "use strict";
    module.exports = function(app) {
        var request = require('supertest');
        var _ = require('underscore');
        var assert = require('assert');
        var mongoose = app.get('mongoose');
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

        var exampleSession = function(data) {
            data = data || {};

            return _.extend({
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

        describe('API All', function() {
            beforeEach(function(done) {
                mongoose.dropAllCollections(done);
            });

            afterEach(function(done) {
                done();
            });

            it('POST /api/all should successfully save 1 event & 1 hit with custom createdAt', function (done) {
                var timestamp = Math.round(new Date().getTime()/1000);
                var diffTimestamp = 2;
                var timestampWithDiff = timestamp + diffTimestamp;

                request(app)
                    .post('/api/all')
                    .send({
                        events: [
                            exampleEvent({createdTimestamp: timestampWithDiff-200})
                        ],
                        hits: [
                            exampleHit({createdTimestamp: timestampWithDiff-100})
                        ],
                        timestamp: timestampWithDiff
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

                        request(app)
                            .get('/api/events')
                            .expect(200)
                            .end(function(err, res) {
                                if (err) {
                                    return done(err);
                                }

                                assert(new Date(res.body[0].createdAt).getTime() === new Date((timestampWithDiff + diffTimestamp - 200) * 1000).getTime());
                                assert(res.body.length === 1);

                                request(app)
                                    .get('/api/hits')
                                    .expect(200)
                                    .end(function(err, res) {
                                        if (err) {
                                            return done(err);
                                        }

                                        assert(new Date(res.body[0].createdAt).getTime() === new Date((timestampWithDiff + diffTimestamp - 100) * 1000).getTime());

                                        assert(res.body.length === 1);
                                        done();
                                    });
                            });
                    });
            });

            it('POST /api/all should successfully save 1 event with custom createdAt, user createdAt should equal event createdAt', function (done) {
                var timestamp = Math.round(new Date().getTime()/1000);
                var timestampWithDiff = timestamp;

                request(app)
                    .post('/api/all')
                    .send({
                        events: [
                            exampleEvent({createdTimestamp: timestampWithDiff-10000})
                        ],
                        timestamp: timestampWithDiff
                    })
                    .expect(201)
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        }

                        assert(res.body.events.length === 1);
                        assert(res.body.events[0].id);

                        request(app)
                            .get('/api/users')
                            .expect(200)
                            .end(function(err, res) {
                                if (err) {
                                    return done(err);
                                }

                                assert(new Date(res.body[0].createdAt).getTime() === new Date((timestampWithDiff - 10000) * 1000).getTime());
                                assert(res.body.length === 1);

                                done();
                            });
                    });
            });

            it('POST /api/all empty [] request, response should contain Bad Request', function (done) {
                request(app)
                    .post('/api/all')
                    .send([])
                    .expect(400)
                    .expect({ error: 'Empty request' })
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        }
                        done();
                    });
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

            it('POST /api/all should successfully save 5 events & 4 hits & 1 session', function (done) {
                var sessionId = '530c11e0ab663db800000000';

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
                        ],
                        sessions: [
                            _.extend(exampleEvent(), {id: sessionId})
                        ]
                    })
                    .expect(201)
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        }

                        assert(res.body.events.length === 5);
                        assert(res.body.hits.length === 4);
                        assert(res.body.sessions.length === 1);
                        assert(res.body.events[0].id);
                        assert(res.body.hits[0].id);
                        assert(res.body.sessions[0].id);

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

            it('POST /api/all should successfully save 1 event & empty hits[]', function (done) {
                request(app)
                    .post('/api/all')
                    .send({
                        events: [
                            exampleEvent()
                        ],
                        hits: [
                        ]
                    })
                    .expect(201)
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        }

                        assert(res.body.events.length === 1);
                        assert(res.body.events[0].id);
                        done();
                    });
            });

            it('POST /api/all should successfully save 1 event', function (done) {
                request(app)
                    .post('/api/all')
                    .send({
                        events: [
                            exampleEvent()
                        ]
                    })
                    .expect(201)
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        }

                        assert(res.body.events.length === 1);
                        assert(res.body.events[0].id);
                        done();
                    });
            });

            it('POST /api/all request with one valid & one invalidate data, response should contain Bad Request, one event created', function (done) {
                request(app)
                    .post('/api/all')
                    .send({
                        events: [
                            exampleEvent(),
                            {
                                server: {
                                    empty: 'empty'
                                },
                                user: {
                                    empty: 'empty'
                                }
                            }
                        ]
                    })
                    .expect(400)
                    .expect({errors: [ 'instance.name is required' ]})
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        }

                        request(app)
                            .get('/api/events')
                            .expect(200)
                            .end(function(err, res) {
                                if (err) {
                                    return done(err);
                                }

                                assert(res.body.length === 1);
                                assert(res.body[0].id);

                                done();
                            });
                    });
            });

            it('POST /api/all should successfully save 2 event & 2 hit & 1 session(sessionId defined)', function (done) {
                var sessionId = '530c11e0ab663db900000000';
                request(app)
                    .post('/api/all')
                    .send({
                        events: [
                            _.extend(exampleEvent(), {session: sessionId}),
                            _.extend(exampleEvent(), {session: sessionId})
                        ],
                        hits: [
                            _.extend(exampleHit(), {session: sessionId}),
                            _.extend(exampleHit(), {session: sessionId})
                        ],
                        sessions: [
                            _.extend(exampleSession(), {id: sessionId})
                        ]
                    })
                    .expect(201)
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        }

                        assert(res.body.sessions.length === 1);
                        assert(res.body.events.length === 2);
                        assert(res.body.hits.length === 2);
                        assert(res.body.events[0].id);
                        assert(res.body.events[1].id);
                        assert(res.body.hits[0].id);
                        assert(res.body.hits[1].id);
                        request(app)
                            .get('/api/sessions')
                            .expect(200)
                            .end(function(err, res) {
                                if (err) {
                                    return done(err);
                                }

                                assert(res.body.length === 1);
                                assert(res.body[0].sessionClientId === sessionId);
                                done();
                            });
                    });
            });

            it('POST /api/all should successfully save 1 event(sessionId not defined)', function (done) {
                request(app)
                    .post('/api/all')
                    .send({
                        events: [
                            exampleEvent()
                        ]
                    })
                    .expect(201)
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        }

                        assert(res.body.events.length === 1);
                        assert(res.body.events[0].id);
                        request(app)
                            .get('/api/sessions')
                            .expect(200)
                            .end(function(err, res) {
                                if (err) {
                                    return done(err);
                                }

                                assert(res.body.length === 0);
                                done();
                            });
                    });
            });
        });
    };
})();
