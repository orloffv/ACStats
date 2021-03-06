(function () {
    "use strict";
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    var app = require('./app')(mongoose);
    var config = app.get('config');

    var listenCount = 0;
    var createServer = function(server, app, port, httpsOptions) {
        var serverInstance;

        if (httpsOptions) {
            serverInstance = server.createServer(httpsOptions, app);
            app.set('httpsInstance', serverInstance);
        } else {
            serverInstance = server.createServer(app);
            app.set('httpInstance', serverInstance);
        }

        serverInstance.listen(port, function() {
            if (!listenCount) {
                app.get('mongoose').connectServer();
            }

            listenCount++;
            app.get('log').info('Express server listening on port ' + port);
        });
    };

    if (config.get('https')) {
        var httpsServer = require('https');
        var fs = require('fs');
        var httpsOptions = {};
        httpsOptions.key = fs.readFileSync(config.get('https:key'));
        httpsOptions.cert = fs.readFileSync(config.get('https:cert'));

        createServer(httpsServer, app, config.get('https:port'), httpsOptions);
    }

    if (config.get('http')) {
        var httpServer = require('http');
        createServer(httpServer, app, config.get('http:port'));
    }
})();
