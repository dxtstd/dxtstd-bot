/*

DATABASE: {
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
    },
    GROUP: {
        REGISTER: {
            CHECK,
            REGISTER,
            UNREGISTER,
            REREGISTER
        },
        FEATURE: {
            NSFW: {
                CHECK,
                SWITCH
            },
            GREETING: {
                CHECK,
                GET,
                SWITCH
            }
        }
    }
}

*/

exports.user = require('./user')
exports.group = require('./group')