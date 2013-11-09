(function () {
    "use strict";
    var EventModel = require('../libs/mongoose').EventModel;
    var log         = require('../libs/log')(module);

    exports.list = function(req, res){
        return EventModel.find(function (err, events) {
            if (!err) {
                return res.send(events);
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.send({ error: 'Server error' });
            }
        });
    };

    exports.get = function(req, res){
        return EventModel.findById(req.params.id, function (err, event) {
            if(!event) {
                res.statusCode = 404;
                return res.send({ error: 'Not found' });
            }
            if (!err) {
                return res.send({ status: 'OK', event:event });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.send({ error: 'Server error' });
            }
        });
    };

    exports.post = function(req, res){
        var event = new EventModel({
            title: req.body.title,
            env: req.body.env
        });

        event.save(function (err) {
            if (!err) {
                log.info("event created");
                return res.send({ status: 'OK', event:event });
            } else {
                if(err.name === 'ValidationError') {
                    res.statusCode = 400;
                    res.send({ error: 'Validation error' });
                } else {
                    res.statusCode = 500;
                    res.send({ error: 'Server error' });
                }
                log.error('Internal error(%d): %s',res.statusCode,err.message);
            }
        });
    };

    exports.delete = function(req, res) {

    };

    exports.put = function(req, res) {

    };
})();
