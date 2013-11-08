(function () {
    "use strict";
    var nconf = require('nconf');

    nconf.argv()
        .env()
        .file({ file: './app/config/config.json' });
    module.exports = nconf;
})();
