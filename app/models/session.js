(function () {
    "use strict";

    var findOrCreate = require('mongoose-findorcreate');
    var moment = require('moment');

    module.exports = function(mongoose) {
        var QueryHelper = require('./../libs/query-helper')(mongoose);
        var Schema   = mongoose.Schema;

        var Session = new Schema({
            createdAt: {type: Date, default: Date.now},
            additional: Schema.Types.Mixed,
            timing: Schema.Types.Mixed,
            user: {type: Schema.Types.ObjectId, ref: 'User'},
            server: {type: Schema.Types.ObjectId, ref: 'Server'},
            useragent: {
                Browser: String,
                Version: String,
                OS: String,
                Platform: String
            }
        });

        Session.statics.countGroupByPartDate = function(where, parts, callback) {
            QueryHelper.countGroupByPartDate(this, where, parts, callback);
        };

        Session.statics.finUserUserAgents = function(where, limit, callback) {
            where.useragent = {$exists: true};

            return this.aggregate(
                {
                    $match: where
                },
                {
                    $group: {
                        _id: {
                            browser : "$useragent.Browser",
                            version : "$useragent.Version",
                            os : "$useragent.OS",
                            platform : "$useragent.Platform"
                        },
                        count: { $sum: 1 },
                        firstAt: {$first: "$createdAt"},
                        lastAt: {$last: "$createdAt"}
                    }
                },
                {
                    $sort: { avg: -1, count: -1 }
                },
                limit,
                callback
            );
        };

        Session.statics.getTimingGroupByPartDate = function(where, parts, callback) {
            var secondsEnd, periodSeconds, secondsInPart;
            if (where.createdAt) {
                secondsEnd = moment(where.createdAt.$gte).format('X');
                periodSeconds = moment(where.createdAt.$lt).format('X') - secondsEnd;
                secondsInPart = Math.floor(periodSeconds / parts);
            }

            where.timing = {$exists: true};
            where['timing.loadPage'] = {$gte: 0};
            where['timing.loadSecurity'] = {$gte: 0};
            where['timing.loadJS'] = {$gte: 0};

            return this.mapReduce({
                map: function() {
                    //((secondsEnd - currentSeconds) / secondsInPart)
                    var part = Math.abs(Math.floor((secondsEnd - (Date.parse(this.createdAt) / 1000)) / secondsInPart));
                    var values = {loadPage: this.timing.loadPage, loadSecurity: this.timing.loadSecurity, loadJS: this.timing.loadJS, count: 1};
                    emit(part, values);
                },
                reduce: function(key, values) {
                    var timing = {loadPage: 0, loadSecurity: 0, loadJS: 0, count: 0};

                    values.forEach(function(v) {
                        timing.loadPage += v.loadPage;
                        timing.loadSecurity += v.loadSecurity;
                        timing.loadJS += v.loadJS;
                        timing.count++;
                    });

                    return timing;
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

        Session.plugin(findOrCreate);

        var SessionModel = mongoose.model('Session', Session);

        var screenModel = {
            id: true,
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

        SessionModel.screens = {
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

        return SessionModel;
    };
})();
