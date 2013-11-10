(function () {
    "use strict";
    module.exports = function(mongoose) {
        var Schema   = mongoose.Schema;

        var Event = new Schema({
            title: { type: String, required: true },
            environment: { type: String, required: true },
            context: Schema.Types.Mixed,
            traits: Schema.Types.Mixed,
            project: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
            user: {
                id: { type: String, required: true },
                traits: Schema.Types.Mixed,
                context: Schema.Types.Mixed
            }
        });

        var EventModel = mongoose.model('Event', Event);

        return EventModel;
    };
})();
