(function () {
    "use strict";
    var request = require('supertest');
    var _ = require('underscore');
    var assert = require('assert');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();

    var app = require('../../../app')(mongoose, 'testing');
    var exampleEvent = function(project) {
        return {
            "environment": "prod",
            "project": project ? project : "first profject",
            "title": "Create Event",
            "context": {
                "where": "applicants",
                "upTime": "102499"
            },
            "user": {
                "id": "6213uyds632",
                "traits": {
                    "name": "Antony",
                    "email": "bigboss@google.com",
                    "company": "Google",
                    "companyId": "312s1231"
                },
                "context": {
                    "subscriptionPlan": "Free"
                }
            },
            "traits": {
                "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.57 Safari/537.17",
                "ip": "10.0.1.32",
                "url": "http://initech.com/pricing"
            }
        };
    };

    before(function(done) {
        mongoose.connect(app.get('config').get('mongoose:uri'), done);
    });

    after(function(done) {
        mongoose.dropAllCollections(function() {
            mongoose.disconnect(done);
        });
    });

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
                    project: 2
                })
                .expect(400)
                .expect({errors: [ 'user.id is required.', 'title is required.' ]})
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it('POST /api/events request with one valid & one invalidate data, response should contain Bad Request, but one event created', function (done) {
            request(app)
                .post('/api/events')
                .send([
                    {
                        environment: 1,
                        project: 2
                    },
                    exampleEvent()
                ])
                .expect(400)
                .expect({errors: [ 'user.id is required.', 'title is required.' ]})
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

        it('GET /api/events/projects should contain empty projects', function (done) {
            request(app)
                .get('/api/events/projects')
                .send()
                .expect(200)
                .expect([])
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    done();
                });
        });

        it('GET /api/events/projects should contain contain 2 projects', function (done) {
            var events = [];
            _.times(100, function() {
                events.push(exampleEvent());
            });

            _.times(100, function() {
                events.push(exampleEvent('second project'));
            });

            request(app)
                .post('/api/events')
                .send(events)
                .expect(201)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    assert(res.body.length === 200);

                    request(app)
                        .get('/api/events/projects')
                        .send()
                        .expect(200)
                        .end(function(err, res) {
                            if (err) {
                                return done(err);
                            }

                            assert(res.body.length === 2);

                            done();
                        });
                });
        });
    });

    process.on('exit', function () {
        mongoose.disconnect();
    });
})();
