(function () {
    "use strict";
    var winston = require('winston');
    require('winston-rollbar');
    require('winston-loggly');

    function getLogger(module, config) {
        var path = module.filename.split('/').slice(-2).join('/');

        var transports = [];

        if (config.get('environment') === 'development') {
            transports.push(
                new winston.transports.Console({
                    colorize:   true,
                    timestamp: true,
                    level:      'debug',
                    label:      path
                })
            );
        }

        if (config.get('log:file')) {
            transports.push(
                new winston.transports.File({
                    filename: config.get('log:file'),
                    level: 'warn'
                })
            );
        }

        if (config.get('rollbarAccessToken')) {
            transports.push(
                new winston.transports.Rollbar({
                    rollbarAccessToken: config.get('rollbarAccessToken'),
                    level: 'warn',
                    rollbarConfig: {
                        environment: config.get('environment')
                    }
                })
            );
        }

        if (config.get('loggly')) {
            transports.push(
                new winston.transports.Loggly({
                    subdomain: config.get('loggly:subdomain'),
                    inputToken: config.get('loggly:inputToken'),
                    auth: {
                        "username": config.get('loggly:username'),
                        "password": config.get('loggly:password')
                    },
                    level: 'info',
                    tags: ['ACStats']
                })
            );
        }

        return new winston.Logger({
            transports : transports
        });
    }

    module.exports = getLogger;
})();
