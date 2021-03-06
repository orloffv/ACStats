(function () {
    "use strict";

    var _ = require('underscore');

    module.exports = function(mongoose) {
        var QueryHelper = require('./../libs/query-helper')(mongoose);
        var Schema   = mongoose.Schema;

        var Event = new Schema({
            name: {type: String, required: true, index: true},
            createdAt: {type: Date, default: Date.now},
            additional: Schema.Types.Mixed,
            user : {type: Schema.Types.ObjectId, ref: 'User'},
            server: {type: Schema.Types.ObjectId, ref: 'Server'},
            session: {type: Schema.Types.ObjectId, ref: 'Session'}
        });

        Event.statics.findAllWithGroupByUser = function(where, callback) {
            return this.aggregate(
                {
                    $match: where
                },
                {
                    $group: {
                        _id: '$user',
                        count: { $sum: 1 },
                        firstAt: {$first: "$createdAt"},
                        lastAt: {$last: "$createdAt"}
                    }
                },
                {
                    $sort: { count: -1 }
                },
                callback
            );
        };

        Event.statics.findAllWithGroupByName = function(options, callback) {
            return this.aggregate(
                {
                    $match: options.where
                },
                {
                    $group: {
                        _id: '$name',
                        count: { $sum: 1 },
                        name: { $first: "$name" },
                        firstAt: {$first: "$createdAt"},
                        lastAt: {$last: "$createdAt"},
                        users: { $addToSet: "$user" },
                        additional: {$addToSet: "$additional"}
                    }
                },
                {
                    $sort: { count: -1 }
                },
                callback
            );
        };

        Event.statics.countGroupByPartDate = function(where, parts, callback) {
            QueryHelper.countGroupByPartDate(this, where, parts, callback);
        };

        Event.statics.findEventPopularByDate = function(where, limit, callback) {
            return this.aggregate(
                {
                    $match: where
                },
                {
                    $group: {
                        _id: '$name',
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
            users: true,
            additional: true
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
