(function () {
    "use strict";
    var mongoose = require('mongoose');
    var Schema   = mongoose.Schema;

    var Event = new Schema({
        title: { type: String, required: true },
        env: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    });

    var EventModel = mongoose.model('Event', Event);
    module.exports = EventModel;
})();
