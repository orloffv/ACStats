(function () {
    "use strict";
    module.exports = function(environement) {

        var nconf = require('nconf');
        var path = require('path');

        nconf.argv().env();

        nconf.overrides({
            environment: environement ? environement : (nconf.get('NODE_ENV') ? nconf.get('NODE_ENV') : 'development')
        });

        nconf.file({ file: path.normalize(__dirname + '/../config/' + nconf.get('environment') + '.json') });

        return nconf;
    };
})();
