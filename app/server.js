(function () {
    "use strict";
    var http = require('http');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    var app = require('./app')(mongoose);
    var port = process.env.PORT || app.get('port');

    http.createServer(app).listen(port, function() {
        app.get('mongoose').connectServer();
        console.log('Express server listening on port ' + port);
        console.log('For exit: press ctrl+c');
    });

    process.on('exit', function (){
        app.get('mongoose').disconnectServer();
    });
})();
