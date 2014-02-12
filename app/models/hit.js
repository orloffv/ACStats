(function () {
    "use strict";

    var _ = require('underscore');

    module.exports = function(mongoose) {
        var Schema   = mongoose.Schema;

        var Hit = new Schema({
            url: {type: String, required: true, index: true},
            createdAt: {type: Date, default: Date.now},
            additional: Schema.Types.Mixed,
            user: {type: Schema.Types.ObjectId, ref: 'User'},
            server: {type: Schema.Types.ObjectId, ref: 'Server'},
            session: {type: Schema.Types.ObjectId, ref: 'Session'}
        });

        Hit.statics.findAllWithGroupByUrl = function(where, callback) {
            _.each(where, function(value, key) {
                if (key === 'user' || key === 'server') {
                    where[key] = mongoose.Types.ObjectId(value);
                }
            });

            return this.
                aggregate(
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
                }, callback);
        };

        var HitModel = mongoose.model('Hit', Hit);

        var screenModel = {
            id: true,
            url: true,
            createdAt: true,
            additional: true,
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
            ids: true,
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
