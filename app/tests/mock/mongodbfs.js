(function () {
    "use strict";
    var mongodbFs = require('../libs/mongodb-fs');
    var path = require('path');
    var collections = {};
    collections.events = require('./event');

    mongodbFs.init({
        port: 27027,
        mocks: {
            ACStats: collections
        },
        fork: true
    });

    module.exports = mongodbFs;
})();
