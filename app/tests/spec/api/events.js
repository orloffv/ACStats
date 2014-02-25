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

        describe('API Events', function() {
            beforeEach(function(done) {
                mongoose.dropAllCollections(done);
            });

            afterEach(function(done) {
                done();
            });

            it('GET /api/events should contain []', function (done) {
                request(app)
                    .get('/api/events')
                    .expect(200)
                    .expect([])
                    .end(function(err, res){
                        if (err) {
                            return done(err);
                        }
                        done();
                    });
            });


            it('GET /api/events/1 should contain not found', function (done) {
                request(app)
                    .get('/api/events/1')
                    .expect(404)
                    .expect({ error: 'Not found' })
                    .end(function(err, res){
                        if (err) {
                            return done(err);
                        }
                        done();
                    });
            });

            it('POST /api/events should successfully save', function (done) {
                request(app)
                    .post('/api/events')
                    .send(exampleEvent())
                    .expect(201)
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        }
                        assert(res.body.id);
                        done();
                    });
            });

            it('POST /api/events should successfully save 2 events', function (done) {
                request(app)
                    .post('/api/events')
                    .send([
                        exampleEvent(),
                        exampleEvent()
                    ])
                    .expect(201)
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        }
                        assert(res.body[0].id);
                        assert(res.body[1].id);
                        assert(res.body.length === 2);
                        assert(res.body[0].user === res.body[1].user);
                        assert(res.body[0].server === res.body[1].server);
                        done();
                    });
            });

            it('GET /api/events should contain 2 events', function (done) {
                request(app)
                    .post('/api/events')
                    .send([
                        exampleEvent(),
                        exampleEvent()
                    ])
                    .expect(201)
                    .end(function(err, res) {
                        request(app)
                            .get('/api/events')
                            .expect(200)
                            .end(function(err, res) {
                                if (err) {
                                    return done(err);
                                }

                                assert(res.body.length === 2);
                                assert(res.body[0].title === exampleEvent().title);
                                assert(res.body[0].user.id === res.body[1].user.id);
                                assert(res.body[0].server.id === res.body[1].server.id);
                                done();
                            });
                    });
            });

            it('GET /api/events/:id should contain event', function (done) {
                request(app)
                    .post('/api/events')
                    .send(exampleEvent())
                    .expect(201)
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        }
                        var id = res.body.id;
                        request(app)
                            .get('/api/events/' + id)
                            .expect(200)
                            .end(function(err, res) {
                                if (err) {
                                    return done(err);
                                }
                                assert(res.body.title === exampleEvent().title);
                                done();
                            });
                    });
            });

            it('POST /api/events empty [] request, response should contain Bad Request', function (done) {
                request(app)
                    .post('/api/events')
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

            it('POST /api/events empty [{}] request, response should contain Bad Request', function (done) {
                request(app)
                    .post('/api/events')
                    .send([{}])
                    .expect(400)
                    .end(function(err, res) {
                        assert(res.body.errors);

                        if (err) {
                            return done(err);
                        }
                        done();
                    });
            });

            it('POST /api/events empty [{}, {}] request, response should contain Bad Request', function (done) {
                request(app)
                    .post('/api/events')
                    .send([{}, {}])
                    .expect(400)
                    .end(function(err, res) {
                        assert(res.body.errors);

                        if (err) {
                            return done(err);
                        }
                        done();
                    });
            });

            it('POST /api/events empty {} request, response should contain Bad Request', function (done) {
                request(app)
                    .post('/api/events')
                    .send({})
                    .expect(400)
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        }

                        assert(res.body.errors);
                        done();
                    });
            });

            it('POST /api/events empty request, response should contain Bad Request', function (done) {
                request(app)
                    .post('/api/events')
                    .send()
                    .expect(400)
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        }

                        assert(res.body.errors);
                        done();
                    });
            });

            it('POST /api/events request with invalidate data, response should contain Bad Request', function (done) {
                request(app)
                    .post('/api/events')
                    .send({
                        environment: 1,
                        server: {
                            empty: 'empty'
                        },
                        user: {
                            empty: 'empty'
                        }
                    })
                    .expect(400)
                    .expect({errors: ['instance.name is required']})
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        }
                        done();
                    });
            });

            it('POST /api/events request with one valid & one invalidate data, response should contain Bad Request, one event created', function (done) {
                request(app)
                    .post('/api/events')
                    .send([
                        exampleEvent(),
                        {
                            server: {
                                empty: 'empty'
                            },
                            user: {
                                empty: 'empty'
                            }
                        }
                    ])
                    .expect(400)
                    .expect({errors: [ 'instance.name is required' ]})
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        }

                        request(app)
                            .get('/api/events')
                            .expect(200)
                            .end(function(err, res){
                                if (err) {
                                    return done(err);
                                }

                                assert(res.body.length === 1);
                                done();
                            });
                    });
            });

            it('GET /api/servers/:id/events should contain 2 events', function (done) {
                request(app)
                    .post('/api/events')
                    .send([
                        exampleEvent(),
                        exampleEvent({user: {"name": "test2@example.com"}}),
                        exampleEvent({server: {"name": "development2"}})
                    ])
                    .expect(201)
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        }

                        assert(res.body.length === 3);

                        request(app)
                            .get('/api/servers/' + res.body[0].server + '/events')
                            .expect(200)
                            .end(function(err, res){
                                if (err) {
                                    return done(err);
                                }

                                assert(res.body.length === 2);
                                done();
                            });
                    });
            });

            it('GET /api/users/:id/events should contain 2 events', function (done) {
                request(app)
                    .post('/api/events')
                    .send([
                        exampleEvent(),
                        exampleEvent(),
                        exampleEvent({user: {"name": "test2@example.com"}})
                    ])
                    .expect(201)
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        }

                        assert(res.body.length === 3);

                        request(app)
                            .get('/api/users/' + res.body[0].user + '/events')
                            .expect(200)
                            .end(function(err, res){
                                if (err) {
                                    return done(err);
                                }

                                assert(res.body.length === 2);
                                done();
                            });
                    });
            });

            it('GET /api/servers/:id/events/grouped should contain 2 events', function (done) {
                request(app)
                    .post('/api/events')
                    .send([
                        exampleEvent(),
                        exampleEvent(),
                        exampleEvent({user: {"name": "test2@example.com"}})
                    ])
                    .expect(201)
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        }

                        assert(res.body.length === 3);

                        request(app)
                            .get('/api/servers/' + res.body[0].server + '/events/grouped')
                            .expect(200)
                            .end(function(err, res){
                                if (err) {
                                    return done(err);
                                }

                                assert(res.body.length === 1);
                                assert(res.body[0].name === exampleEvent().name);
                                assert(res.body[0].users === 2);
                                assert(res.body[0].count === 3);
                                done();
                            });
                    });
            });

            it('GET /api/users/:id/events/grouped should contain 2 events', function (done) {
                request(app)
                    .post('/api/events')
                    .send([
                        exampleEvent(),
                        exampleEvent(),
                        exampleEvent({user: {"name": "test2@example.com"}})
                    ])
                    .expect(201)
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        }

                        assert(res.body.length === 3);

                        request(app)
                            .get('/api/users/' + res.body[0].user + '/events/grouped')
                            .expect(200)
                            .end(function(err, res){
                                if (err) {
                                    return done(err);
                                }

                                assert(res.body.length === 1);
                                assert(res.body[0].name === exampleEvent().name);
                                assert(res.body[0].users === 1);
                                assert(res.body[0].count === 2);
                                done();
                            });
                    });
            });
        });
    };
})();
