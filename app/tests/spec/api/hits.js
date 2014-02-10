(function () {
    "use strict";
    var request = require('supertest');
    var _ = require('underscore');
    var assert = require('assert');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();

    var app = require('../../../app')(mongoose, 'testing');
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

    describe('API Hits', function() {
        beforeEach(function(done) {
            mongoose.dropAllCollections(done);
        });

        afterEach(function(done) {
            done();
        });

        it('GET /api/hits should contain []', function (done) {
            request(app)
                .get('/api/hits')
                .expect(200)
                .expect([])
                .end(function(err, res){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });


        it('GET /api/hits/1 should contain not found', function (done) {
            request(app)
                .get('/api/hits/1')
                .expect(404)
                .expect({ error: 'Not found' })
                .end(function(err, res){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it('POST /api/hits should successfully save', function (done) {
            request(app)
                .post('/api/hits')
                .send(exampleHit())
                .expect(201)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert(res.body.id);
                    done();
                });
        });

        it('POST /api/hits should successfully save 2 hits', function (done) {
            request(app)
                .post('/api/hits')
                .send([
                    exampleHit(),
                    exampleHit()
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

        it('GET /api/hits should contain 2 hits', function (done) {
            request(app)
                .post('/api/hits')
                .send([
                    exampleHit(),
                    exampleHit()
                ])
                .expect(201)
                .end(function(err, res) {
                    request(app)
                        .get('/api/hits')
                        .expect(200)
                        .end(function(err, res) {
                            if (err) {
                                return done(err);
                            }

                            assert(res.body.length === 2);
                            assert(res.body[0].url === exampleHit().url);
                            assert(res.body[0].user.id === res.body[1].user.id);
                            assert(res.body[0].server.id === res.body[1].server.id);
                            done();
                        });
                });
        });

        it('GET /api/hits/:id should contain hint', function (done) {
            request(app)
                .post('/api/hits')
                .send(exampleHit())
                .expect(201)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    var id = res.body.id;
                    request(app)
                        .get('/api/hits/' + id)
                        .expect(200)
                        .end(function(err, res) {
                            if (err) {
                                return done(err);
                            }
                            assert(res.body.url === exampleHit().url);
                            done();
                        });
                });
        });

        it('POST /api/hits empty [] request, response should contain Bad Request', function (done) {
            request(app)
                .post('/api/hits')
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

        it('POST /api/hits empty [{}] request, response should contain Bad Request', function (done) {
            request(app)
                .post('/api/hits')
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

        it('POST /api/hits empty [{}, {}] request, response should contain Bad Request', function (done) {
            request(app)
                .post('/api/hits')
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

        it('POST /api/hits empty {} request, response should contain Bad Request', function (done) {
            request(app)
                .post('/api/hits')
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

        it('POST /api/hits empty request, response should contain Bad Request', function (done) {
            request(app)
                .post('/api/hits')
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

        it('POST /api/hits request with invalidate data, response should contain Bad Request', function (done) {
            request(app)
                .post('/api/hits')
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
                .expect({errors: ['instance.url is required']})
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it('POST /api/hits request with one valid & one invalidate data, response should contain Bad Request, one hint created', function (done) {
            request(app)
                .post('/api/hits')
                .send([
                    exampleHit(),
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
                .expect({errors: [ 'instance.url is required' ]})
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    request(app)
                        .get('/api/hits')
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

        it('GET /api/servers/:id/hits should contain 2 hits', function (done) {
            request(app)
                .post('/api/hits')
                .send([
                    exampleHit(),
                    exampleHit({user: {"name": "test2@example.com"}}),
                    exampleHit({server: {"name": "development2"}})
                ])
                .expect(201)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    assert(res.body.length === 3);

                    request(app)
                        .get('/api/servers/' + res.body[0].server + '/hits')
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

        it('GET /api/users/:id/hits should contain 2 hits', function (done) {
            request(app)
                .post('/api/hits')
                .send([
                    exampleHit(),
                    exampleHit(),
                    exampleHit({user: {"name": "test2@example.com"}})
                ])
                .expect(201)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    assert(res.body.length === 3);

                    request(app)
                        .get('/api/users/' + res.body[0].user + '/hits')
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
    });

    process.on('exit', function () {
        mongoose.disconnect();
    });
})();
