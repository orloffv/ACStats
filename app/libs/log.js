(function () {
    "use strict";
    var winston = require('winston');
    var config = require('./config');

    function getLogger(module) {
        var path = module.filename.split('/').slice(-2).join('/'); //отобразим метку с именем файла, который выводит сообщение

        return new winston.Logger({
            transports : [
                new winston.transports.Console({
                    colorize:   true,
                    level:      'debug',
                    label:      path
                }),
                new winston.transports.File({
                    filename: config.get('log:file'),
                    level: 'warn'
                })
            ]
        });
    }

    module.exports = getLogger;
})();
