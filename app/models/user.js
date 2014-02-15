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

        User.statics.countNewCompanies = function(where, callback) {
            where.additional = {$gt:{}};
            where['additional.companyId'] = {$gte: ""};

            var unixFrom = moment(where.createdAt.$gte).valueOf();

            return this.mapReduce({
                map: function() {
                    var key = this.additional.companyId;
                    var value = {createdAts: [this.createdAt]};
                    emit(key, value);
                },
                reduce: function(key, values) {
                    var result = {createdAts: []};
                    values.forEach(function(v) {
                        if (unixFrom < Date.parse(v.createdAts[0])) {
                            result.createdAts.push(v.createdAts[0]);
                        }
                    });

                    return result;
                },
                finalize: function(key, reducedVal) {
                    return Boolean(reducedVal.createdAts.length);
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
