(function () {
    "use strict";

    module.exports = function() {
        var DateHelper = function () {};

        DateHelper.prototype = {
            getTimestamp: function() {
                return Math.round(new Date().getTime()/1000);
            },
            getCreatedAt: function(timestamp, createdTimestamp, currentTimestamp) {
                if (timestamp && createdTimestamp) {
                    currentTimestamp = currentTimestamp || DateHelper.prototype.getTimestamp();

                    var diffTimestamp = currentTimestamp - timestamp;

                    return new Date((createdTimestamp - diffTimestamp)*1000);
                }

                return null;
            }
        };

        return new DateHelper();
    };
})();
