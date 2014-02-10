(function () {
    "use strict";

    var findOrCreate = require('mongoose-findorcreate');

    module.exports = function(mongoose) {
        var Schema   = mongoose.Schema;

        var Server = new Schema({
            name: {type: String, required: true, index: true, unique: true},
            users: [{ type: Schema.Types.ObjectId, ref: 'User'}]
        });

        Server.plugin(findOrCreate);

        var ServerModel = mongoose.model('Server', Server);

        var screenModel = {
            id: true,
            name: true
        };

        ServerModel.screens = {
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

        return ServerModel;
    };
})();
