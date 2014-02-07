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

        
    });

    process.on('exit', function () {
        mongoose.disconnect();
    });
})();
