(function () {
    "use strict";
    var request = require('supertest');
    var mongodbFs = require('../../mock/mongodbfs');
    var mongoose = require('mongoose');
    var app = require('../../../app');
    var config      = require('../../../libs/config');
    var assert = require("assert");
    config.set('mongoose:uri', 'mongodb://localhost:27027/ACStats');

    describe('API Events', function() {
        beforeEach(function(done) {
            mongodbFs.start(function() {
                app.get('mongoose').connect(done);
            });
        });

        afterEach(function(done) {
            app.get('mongoose').disconnect(function (err) {
                mongodbFs.stop(done);
            });
        });

        it('GET /api/events should contain []', function (done) {
            request(app)
                .get('/api/events')
                .expect(200)
                .expect([], done);
        });

        it('GET /api/events/1 should contain not found', function (done) {
            request(app)
                .get('/api/events/1')
                .expect(404)
                .expect({ error: 'Not found' }, done);
        });

        it('POST /api/events should successfully save', function (done) {
            request(app)
                .post('/api/events')
                .send({
                    environment: 'prod',
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
                            where: 'applicants'
                        }
                    },
                    traits: {
                        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.57 Safari/537.17',
                        ip: '10.0.1.32'
                    },
                    context: {
                        url: 'http://initech.com/pricing',
                        upTime: '102499'
                    }
                })
                .expect(201)
                .end(function(err, res){
                    assert(res.body.id);
                    done();
                });
        });
    });

    process.on('exit', function () {
        if (mongodbFs.isRunning()) {
            app.get('mongoose').disconnect(function (err) {
                mongodbFs.stop();
            });
        }
    });
})();
