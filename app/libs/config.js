(function () {
    "use strict";
    var nconf = require('nconf');

    nconf.argv()
        .env()
        .file({ file: __dirname + '/../config/config.json' });
    module.exports = nconf;
})();
