(function () {
    "use strict";

    var mongooseErrorHelper = require('mongoose-error-helper').errorHelper;

    module.exports = function(log) {
        return function(err, res) {

            if (err.name === 'SchemaError') {
                res.statusCode = 400;

                return res.send({ errors: err.errors});
            } else if (err.name === 'ValidationError') {
                res.statusCode = 400;

                return res.send({ errors: mongooseErrorHelper(err)});
            } else if (err.name === 'Empty') {
                res.statusCode = 400;

                return res.send({error: 'Empty request'});
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s', res.statusCode, err.message);

                return res.send({error: 'Server error'});
            }
        };
    };
})();
