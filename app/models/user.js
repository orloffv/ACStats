(function () {
    "use strict";

    var findOrCreate = require('mongoose-findorcreate');

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
