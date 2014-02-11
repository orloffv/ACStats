(function () {
    "use strict";
    var winston = require('winston');
    require('winston-rollbar').Rollbar;

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


            if (config.get('rollbarAccessToken')) {
                transports.push(
                    new winston.transports.Rollbar({
                        rollbarAccessToken: config.get('rollbarAccessToken'),
                        level: 'warn'
                    })
                );
            }
        }

        return new winston.Logger({
            transports : transports
        });
    }

    module.exports = getLogger;
})();
