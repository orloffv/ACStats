(function () {
    "use strict";

    var _ = require('underscore');
    var moment = require('moment');

    module.exports = function(mongoose) {
        var QueryHelper = require('./../libs/query-helper')(mongoose);
        var Schema   = mongoose.Schema;

        var Hit = new Schema({
            url: {type: String, required: true, index: true},
            createdAt: {type: Date, default: Date.now},
            additional: Schema.Types.Mixed,
            timing: Schema.Types.Mixed,
            user: {type: Schema.Types.ObjectId, ref: 'User'},
            server: {type: Schema.Types.ObjectId, ref: 'Server'},
            session: {type: Schema.Types.ObjectId, ref: 'Session'}
        });

        Hit.virtual('timestamp').get(function() {
            return this.createdAt.getTime();
        });

        Hit.statics.findActiveUsers = function(where, limit, callback) {
            return this.aggregate(
                {
                    $match: where
                },
                {
                    $group: {
                        _id: '$user',
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                },
                limit,
                callback
            );
        };

        Hit.statics.findAllWithGroupByUrl = function(where, callback) {
            return this.aggregate(
                {
                    $match: where
                },
                {
                    $group: {
                        _id: '$url',
                        count: { $sum: 1 },
                        url: { $first: "$url" },
                        firstAt: {$first: "$createdAt"},
                        lastAt: {$last: "$createdAt"},
                        ids: { $addToSet: "$_id" },
                        users: { $addToSet: "$user" }
                    }
                },
                {
                    $sort: { count: -1 }
                },
                callback
            );
        };

        Hit.statics.findHitSlowestByDate = function(where, limit, callback) {
            where.timing = {$exists: true};
            where['timing.loadHit'] = {$gte: 0};

            return this.aggregate(
                {
                    $match: where
                },
                {
                    $group: {
                        _id: '$url',
                        count: { $sum: 1 },
                        loadHit: {$sum: "$timing.loadHit"},
                        avg: {$avg: "$timing.loadHit"}
                    }
                },
                {
                    $sort: { avg: -1, count: -1 }
                },
                limit,
                callback
            );
        };

        Hit.statics.countGroupByPartDate = function(where, parts, callback) {
            QueryHelper.countGroupByPartDate(this, where, parts, callback);
        };

        var HitModel = mongoose.model('Hit', Hit);

        var screenModel = {
            id: true,
            url: true,
            createdAt: true,
            additional: true,
            timing: true,
            user: {
                id: true,
                name: true,
                additional: true
            },
            server: {
                id: true,
                name: true
            }
        };

        var groupedModel = {
            url: true,
            count: true,
            firstAt: true,
            lastAt: true,
            users: true
        };

        HitModel.screens = {
            model: screenModel,
            collection: [
                screenModel
            ],
            groupedCollection: [
                groupedModel
            ],
            postModel: {
                id: true,
                server: true,
                user: true
            },
            postCollection: [
                {
                    id: true,
                    server: true,
                    user: true
                }
            ]
        };
        /*
        HitModel.insides = {
            postModel: {
                url: true,
                createdAt: true,
                additional: true,
                server: '{serverId}',
                user: '{userId}'
            }
        };
        */

        return HitModel;
    };
})();
