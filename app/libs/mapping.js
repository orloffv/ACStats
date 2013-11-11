(function () {
    "use strict";
    var _ = require('underscore');

    module.exports = function(object, mapping) {
        if (!_.size(mapping)) {
            return object;
        }

        var updateObject = function(object) {
            var toUnset = [];
            _.each(mapping, function(key, newKey) {
                object[newKey] = object[key];
                toUnset.push(key);
            });

            _.each(toUnset, function(key) {
                delete object[key];
            });

            return object;
        };

        if (_.isArray(object)) {
            object = _.map(object, function(model) {return updateObject(model);});
        } else {
            object = updateObject(object);
        }

        return object;
    };
})();
