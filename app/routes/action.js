(function () {
    "use strict";
    var ActionModel = require('../libs/mongoose').ActionModel;
    var log         = require('../libs/log')(module);

    exports.list = function(req, res){
        return ActionModel.find(function (err, actions) {
            if (!err) {
                return res.send(actions);
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.send({ error: 'Server error' });
            }
        });
    };

    exports.get = function(req, res){
        return ActionModel.findById(req.params.id, function (err, action) {
            if(!action) {
                res.statusCode = 404;
                return res.send({ error: 'Not found' });
            }
            if (!err) {
                return res.send({ status: 'OK', action:action });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.send({ error: 'Server error' });
            }
        });
    };

    exports.post = function(req, res){
        var action = new ActionModel({
            title: req.body.title,
            env: req.body.env
        });

        action.save(function (err) {
            if (!err) {
                log.info("action created");
                return res.send({ status: 'OK', action:action });
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
})();
