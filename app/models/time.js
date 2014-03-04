(function () {
    "use strict";

    var _ = require('underscore');

    module.exports = function(mongoose) {
        var QueryHelper = require('./../libs/query-helper')(mongoose);
        var Schema   = mongoose.Schema;

        var Time = new Schema({
            type: {type: String, required: true, index: true},
            url: {type: String, required: true, index: true},
            method: {type: String, required: true, index: true},
            status: {type: Number, required: true, index: true},
            createdAt: {type: Date, default: Date.now, index: true},
            additional: Schema.Types.Mixed,
            timing: Schema.Types.Mixed,
            user: {type: Schema.Types.ObjectId, ref: 'User'},
            server: {type: Schema.Types.ObjectId, ref: 'Server', index: true}
        });

        var TimeModel = mongoose.model('Time', Time);

        TimeModel.screens = {

        };

        return TimeModel;
    };
})();
