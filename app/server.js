(function () {
    "use strict";
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    var app = require('./app')(mongoose);
    var config = app.get('config');

    var createServer = function(server, app, port, httpsOptions) {
        var serverInstance;

        if (httpsOptions) {
            serverInstance = server.createServer(httpsOptions, app);
        } else {
            serverInstance = server.createServer(app);
        }

        serverInstance.listen(port, function() {
            if (!app.get('mongoose').isConnected()) {
                app.get('mongoose').connectServer();
            }

            console.log('Express server listening on port ' + port);
            console.log('For exit: press ctrl+c');
        });
    };

    if (config.get('https')) {
        var httpsServer = require('https');
        var fs = require('fs');
        var httpsOptions = {};
        httpsOptions.key = fs.readFileSync(config.get('https').key);
        httpsOptions.cert = fs.readFileSync(config.get('https').cert);

        createServer(httpsServer, app, config.get('https').port, httpsOptions);
    }

    var httpServer = require('http');
    createServer(httpServer, app, config.get('http').port);

    process.on('exit', function (){
        app.get('mongoose').disconnectServer();
    });
})();
