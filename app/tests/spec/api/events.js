(function () {
    "use strict";
    var request = require('supertest');
    var config      = require('../../../libs/config');
    var assert = require('assert');
    var mockgoose = require('mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    var app = require('../../../app')(mongoose);
    var exampleEvent = {
        environment: 'prod',
        project: 'first profject',
        user: {
            id: '128df8234',
            traits: {
                name: 'Antony',
                email: 'bigboss@google.com',
                company: 'Google',
                companyId: '312s1231'
            },
            context: {
                subscriptionPlan: 'Free'
            }
        },
        event: {
            title: 'Create Event',
            context: {
                where: 'applicants',
                upTime: '102499'
            }
        },
        traits: {
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.57 Safari/537.17',
            ip: '10.0.1.32',
            url: 'http://initech.com/pricing'
        }
    };

    before(function(done) {
        mongoose.connect('mongodb://localhost:27017/ACStats', done);
    });

    after(function(done) {
        mongoose.disconnect(done);
    });

    describe('API Events', function() {
        beforeEach(function(done) {
            mockgoose.reset();
            done();
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
                .send(exampleEvent)
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
                    exampleEvent,
                    exampleEvent
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
                exampleEvent,
                exampleEvent
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
                            assert(res.body[0].title === exampleEvent.event.title);
                            done();
                        });
                });
        });

        it('GET /api/events/:id should contain event', function (done) {
            request(app)
                .post('/api/events')
                .send(exampleEvent)
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
                            assert(res.body.title === exampleEvent.event.title);
                            done();
                        });
                });
        });
    });

    process.on('exit', function () {
        //if (mongodbFs.isRunning()) {
        mongoose.disconnect(function (err) {
            //mongodbFs.stop();
        });
        //}
    });
})();
