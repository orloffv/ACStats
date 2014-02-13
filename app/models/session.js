(function () {
    "use strict";

    var findOrCreate = require('mongoose-findorcreate');
    var moment = require('moment');

    module.exports = function(mongoose) {
        var Schema   = mongoose.Schema;

        var Session = new Schema({
            createdAt: {type: Date, default: Date.now},
            additional: Schema.Types.Mixed,
            timing: Schema.Types.Mixed,
            user: {type: Schema.Types.ObjectId, ref: 'User'},
            server: {type: Schema.Types.ObjectId, ref: 'Server'}
        });

        Session.statics.countGrouped = function(where, parts, callback) {
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
