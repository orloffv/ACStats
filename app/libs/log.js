(function () {
    "use strict";
    var winston = require('winston');

    function getLogger(module, config) {
        var path = module.filename.split('/').slice(-2).join('/'); //отобразим метку с именем файла, который выводит сообщение

        var transports = [];

        if (config.get('environment') === 'development' || config.get('environment') === 'testing') {
            transports.push(
                new winston.transports.Console({
                    colorize:   true,
                    level:      'debug',
                    label:      path
                })
            );
        }

        if (config.get('environment') !== 'testing') {
            transports.push(
                new winston.transports.File({
                    filename: config.get('log:file'),
                    level: 'warn'
                })
            );
        }

        return new winston.Logger({
            transports : transports
        });
    }

    module.exports = getLogger;
})();
