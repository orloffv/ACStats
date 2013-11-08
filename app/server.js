(function () {
    "use strict";
    var express = require('express');
    var routes = require('./routes');
    var routesAction = require('./routes/action');
    var http = require('http');
    var path = require('path');
    var log = require('./libs/log')(module);
    var config = require('./libs/config');

    var app = express();

    // all environments
    app.set('port', config.get('port'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(app.router);

    app.use(function(req, res, next){
        res.status(404);
        log.debug('Not found URL: %s', req.url);
        res.send({ error: 'Not found' });

        return;
    });

    app.use(function(err, req, res, next){
        res.status(err.status || 500);
        log.error('Internal error(%d): %s', res.statusCode, err.message);
        res.send({ error: err.message });

        return;
    });

    app.get('/', routes.index);

    app.get('/api/actions', routesAction.list);
    app.post('/api/actions', routesAction.post);
    app.get('/api/actions/:id', routesAction.get);

    http.createServer(app).listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
        console.log('For exit: press ctrl+c');
    });
})();
