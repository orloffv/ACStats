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

        Time.statics.findTimeSlowestByDate = function(where, limit, callback) {
            where.timing = {$exists: true};
            where['timing.load'] = {$gte: 0};

            return this.aggregate(
                {
                    $match: where
                },
                {
                    $project: {
                        hitDivision: {$divide: [1, '$timing.load']},
                        url: 1,
                        timingLoadHit: '$timing.load'
                    }
                },
                {
                    $group: {
                        _id: '$url',
                        count: { $sum: 1 },
                        sumHitDivision: {$sum: "$hitDivision"}
                    }
                },
                {
                    $project: {
                        avg: {$divide: ['$count', '$sumHitDivision']},
                        url: 1,
                        count: 1
                    }
                },
                {
                    $sort: { avg: -1, count: -1 }
                },
                limit,
                callback
            );
        };

        var TimeModel = mongoose.model('Time', Time);

        TimeModel.screens = {

        };

        return TimeModel;
    };
})();
