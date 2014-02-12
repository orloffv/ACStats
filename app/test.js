(function () {
    "use strict";
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    var app = require('./app')(mongoose, 'testing');

    before(function (done) {
        app.get('mongoose').connectServer(function() {
            require('./tests/spec/api/all')(app);
            require('./tests/spec/api/events')(app);
            require('./tests/spec/api/hits')(app);
            done();
        });
    });

    describe('Loader tests', function() {
        it('loading..', function(done) {
            done();
        });
    });
})();
