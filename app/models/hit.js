(function () {
    "use strict";
    module.exports = function(mongoose) {
        var Schema   = mongoose.Schema;

        var Hit = new Schema({
            url: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
            additional: Schema.Types.Mixed,
            user : { type: Schema.Types.ObjectId, ref: 'User' },
            server: {type: Schema.Types.ObjectId, ref: 'Server'}
        });

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

        HitModel.screens = {
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

        return HitModel;
    };
})();
