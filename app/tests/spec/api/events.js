(function () {
    "use strict";
    var request = require('supertest');
    var mongodbFs = require('../../mock/mongodbfs');
    var mongoose = require('mongoose');
    var app = require('../../../app');

    describe('API Events', function() {
        beforeEach(function(done) {
            mongodbFs.start(function() {
                app.get('mongoose').connect('mongodb://localhost:27027/ACStats', done);
            });
        });

        afterEach(function(done) {
            app.get('mongoose').disconnect(function (err) {
                mongodbFs.stop(done);
            });
        });

        it('GET /api/events should contain []', function (done) {
            request(app).get('/api/events').expect([], done);
        });

        it('GET /api/events/1 should contain not found', function (done) {
            request(app).get('/api/events/1').expect({ error: 'Not found' }, done);
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
