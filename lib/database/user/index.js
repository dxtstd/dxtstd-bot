/*

USER: {
    REGISTER: {
        CHECK,
        REGISTER,
        UNREGISTER,
        REREGISTER
    },
    LIMIT: {
        CHECK,
        ADD,
        USE
    }
}

*/

exports.register = require('./register')
exports.limit = require('./limit')