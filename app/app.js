(function () {
    "use strict";
    module.exports = function(mongoose, environment) {
        return require('./main')(mongoose, environment);
    };
})();
