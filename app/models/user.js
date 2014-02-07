(function () {
    "use strict";

    var findOrCreate = require('mongoose-findorcreate');

    module.exports = function(mongoose) {
        var Schema   = mongoose.Schema;

        var User = new Schema({
            name: { type: String, required: true },
            additional: Schema.Types.Mixed,
            server: {type: Schema.Types.ObjectId, ref: 'Server'},
            hits: [{ type: Schema.Types.ObjectId, ref: 'Hit'}],
            sessions: [{ type: Schema.Types.ObjectId, ref: 'Session'}]
        });

        User.plugin(findOrCreate);

        var UserModel = mongoose.model('User', User);

        var screenModel = {
            id: true,
            name: true,
            additional: true,
            server: {
                id: true,
                name: true
            }
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
