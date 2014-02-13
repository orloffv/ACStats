(function () {
    "use strict";

    var _ = require('underscore');
    var moment = require('moment');

    module.exports = function(mongoose) {
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

        Hit.statics.countGrouped = function(where, parts, callback) {
            var periodSeconds = moment(where.createdAt.$lt).format('X') - moment(where.createdAt.$gte).format('X');
            var secondsEnd = moment(where.createdAt.$gte).format('X');
            var secondsInPart = Math.floor(periodSeconds / parts);

            return this.mapReduce({
                map: function() {
                    //((secondsEnd - currentSeconds) / secondsInPart)
                    var part = Math.abs(Math.floor((secondsEnd - (Date.parse(this.createdAt) / 1000)) / secondsInPart));
                    emit(part, 1);
                },
                reduce: function(key, values) {
                    return Array.sum(values);
                },
                query: where,
                out: {
                    inline:1
                },
                verbose: false,
                scope: {
                    secondsEnd: secondsEnd,
                    secondsInPart: secondsInPart
                }
            }, callback);
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
