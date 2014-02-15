(function () {
    "use strict";

    var _ = require('underscore'),
        moment = require('moment');

    module.exports = function(mongoose) {
        var QueryHelper = function () {};

        QueryHelper.prototype = {
            getWhere: function(where, options) {
                where = where || {};
                options = options || {};

                var whereExpressions = {};

                _.each(where, function(value, key) {
                    if (key === 'user' || key === 'server') {
                        whereExpressions[key] = mongoose.Types.ObjectId(value);
                    }
                });

                if (options.query) {
                    if (options.query.from || options.query.to) {
                        whereExpressions.createdAt = {};

                        if (options.query.from) {
                            whereExpressions.createdAt.$gte = moment(options.query.from, "DD-MM-YYYY")._d;
                        }

                        if (options.query.to) {
                            whereExpressions.createdAt.$lt = moment(options.query.to + ' 23:59:59', "DD-MM-YYYY HH:mm:ss")._d;
                        }
                    }
                }

                return whereExpressions;
            },
            countGroupByPartDate: function(that, where, parts, callback) {
                var secondsEnd, periodSeconds, secondsInPart;
                if (where.createdAt) {
                    secondsEnd = moment(where.createdAt.$gte).format('X');
                    periodSeconds = moment(where.createdAt.$lt).format('X') - secondsEnd;
                    secondsInPart = Math.floor(periodSeconds / parts);
                }

                return that.mapReduce({
                    map: function() {
                        //((secondsEnd - currentSeconds) / secondsInPart)
                        var part = Math.abs(Math.floor((secondsEnd - (Date.parse(this.createdAt) / 1000)) / secondsInPart));
                        emit(part, 1);
                    },
                    reduce: function(key, values) {
                        return Array.sum(values);
                    },
                    query: where,
                    out: {
                        inline:1
                    },
                    verbose: false,
                    scope: {
                        secondsEnd: secondsEnd,
                        secondsInPart: secondsInPart
                    }
                }, callback);
            }
        };

        return new QueryHelper();
    };
})();
