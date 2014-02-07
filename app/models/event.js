(function () {
    "use strict";
    module.exports = function(mongoose) {
        var Schema   = mongoose.Schema;

        var Event = new Schema({
            name: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
            additional: Schema.Types.Mixed,
            user : { type: Schema.Types.ObjectId, ref: 'User' },
            server: {type: Schema.Types.ObjectId, ref: 'Server'}
        });

        var EventModel = mongoose.model('Event', Event);

        var screenModel = {
            id: true,
            name: true,
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

        EventModel.screens = {
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
         EventModel.insides = {
             postModel: {
                 name: true,
                 createdAt: true,
                 additional: true,
                 server: '{serverId}',
                 user: '{userId}'
             }
         };
         */

        return EventModel;
    };
})();
