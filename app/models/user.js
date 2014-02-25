(function () {
    "use strict";

    var findOrCreate = require('mongoose-findorcreate');
    var moment = require('moment');

    module.exports = function(mongoose) {
        var Schema   = mongoose.Schema;

        var User = new Schema({
            name: {type: String, required: true, index: true},
            additional: Schema.Types.Mixed,
            createdAt: {type: Date, default: Date.now},
            server: {type: Schema.Types.ObjectId, ref: 'Server'},
            lastHitAt: {type: Date},
            hits: {type: Number},
            sessions: {type: Number},
            events: {type: Number}
        });

        User.statics.findAllCompanies = function(options, callback) {
            options.where['additional.companyId'] = {$exists: true};

            return this.aggregate(
                {
                    $match: options.where
                },
                {
                    $group: {
                        _id: '$additional.companyId',
                        name: { $first: '$additional.company' },
                        count: { $sum: 1 },
                        hits: {$sum: '$hits'},
                        events: {$sum: '$events'},
                        lastHitAt: {$last: '$lastHitAt'},
                        createdAt: {$first: '$createdAt'}
                    }
                },
                {
                    $sort: options.sort
                },
                callback
            );
        };

        User.statics.countNewCompanies = function(where, callback) {
            var createdAt = where.createdAt;
            where.createdAt = {$exists: true};
            where['additional.companyId'] = {$exists: true};

            var unixFrom = moment(createdAt.$gte).valueOf();

            return this.mapReduce({
                map: function() {
                    var key = this.additional.companyId;
                    var value = {createdAtTrue: [], createdAtFalse: []};

                    if (unixFrom > Date.parse(this.createdAt)) {
                        value.createdAtFalse.push(this.createdAt);
                    } else {
                        value.createdAtTrue.push(this.createdAt);
                    }

                    emit(key, value);
                },
                reduce: function(key, values) {
                    var result = {createdAtFalse: [], createdAtTrue: []};
                    values.forEach(function(v) {
                        if (v.createdAtFalse.length) {
                            result.createdAtFalse.push(v.createdAtFalse[0]);
                        }

                        if (v.createdAtTrue.length) {
                            result.createdAtTrue.push(v.createdAtTrue[0]);
                        }

                        if (v.createdAtTrue.length && result.createdAtFalse.length) {
                            return result;
                        }
                    });

                    return result;
                },
                finalize: function(key, reducedVal) {
                    return Boolean(reducedVal.createdAtTrue.length && ! reducedVal.createdAtFalse.length);
                },
                query: where,
                out: {
                    inline:1
                },
                scope: {
                    unixFrom: unixFrom
                },
                verbose: false
            }, callback);
        };

        User.plugin(findOrCreate);

        User.index({name: 1, server: 1}, {unique: true});

        var UserModel = mongoose.model('User', User);

        var screenModel = {
            id: true,
            name: true,
            additional: true,
            createdAt: true,
            lastHitAt: true,
            server: {
                id: true,
                name: true
            },
            hits: true,
            events: true,
            sessions: true
        };

        UserModel.screens = {
            model: screenModel,
            collection: [
                screenModel
            ],
            postModel: {
                id: true
            },
            postCollection: [
                {
                    id: true
                }
            ]
        };
        /*
        UserModel.insides = {
            postModel: {
                name: true,
                additional: true,
                server: '{serverId}'
            }
        };
        */

        return UserModel;
    };
})();
