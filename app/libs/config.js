(function () {
    "use strict";
    var nconf = require('nconf');
    var path = require('path');

    nconf.argv()
        .env()
        .file({ file: path.normalize(__dirname + '/../config/config.json') });
    module.exports = nconf;
})();
