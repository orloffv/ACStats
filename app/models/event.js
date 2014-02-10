(function () {
    "use strict";

    var _ = require('underscore');

    module.exports = function(mongoose) {
        var Schema   = mongoose.Schema;

        var Event = new Schema({
            name: {type: String, required: true, index: true},
            createdAt: {type: Date, default: Date.now},
            additional: Schema.Types.Mixed,
            user : {type: Schema.Types.ObjectId, ref: 'User'},
            server: {type: Schema.Types.ObjectId, ref: 'Server'}
        });

        Event.statics.findAllWithGroupByName = function(where, callback) {
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
                        _id: '$name',
                        count: { $sum: 1 },
                        name: { $first: "$name" },
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

        var EventModel = mongoose.model('Event', Event);

        var screenModel = {
            id: true,
            name: true,
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
            name: true,
            count: true,
            firstAt: true,
            lastAt: true,
            ids: true,
            users: true
        };

        EventModel.screens = {
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
         EventModel.insides = {
             postModel: {
                 name: true,
                 createdAt: true,
                 additional: true,
                 server: '{serverId}',
                 user: '{userId}'
             }
         };
         */

        return EventModel;
    };
})();
