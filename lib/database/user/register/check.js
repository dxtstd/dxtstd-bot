const fs = require('fs')
const path = require('path')

/*

_dbu = _database_users
_dbup = database_users_path

*/

/*

DATABASE USER
{
    name: <name>,
    phone: <number phone>,
    stats: {
        limit: <int>,
        banned: <boolean>
    },
    uid: <int>
}

*/

module.exports = function (sender) {
    if (sender == undefined) {
        throw new Error('Pls add sender')
        return
    }
    
    try {
        _dbup = path.join(__dirname, "../../../..", "/database", "/users.json")
        _dbu = JSON.parse(fs.readFileSync(_dbup))

        position = false
        for (let i in _dbu) {
            if (_dbu[i].phone === sender) {
                position = true
            }
        }

        return position
    } catch (e) {
        throw new Error(e)
    }
}