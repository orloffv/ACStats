(function () {
    "use strict";
    module.exports = function(mongoose) {
        var Schema   = mongoose.Schema;

        var Session = new Schema({
            createdAt: { type: Date, default: Date.now },
            user : { type: Schema.Types.ObjectId, ref: 'User' },
            server: {type: Schema.Types.ObjectId, ref: 'Server'}
        });

        var SessionModel = mongoose.model('Session', Session);

        var screenModel = {
            id: true,
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
