import * as defaults from '../../Defaults'
import * as types from '../../Types'

export function updateData (bot, contact) {
    bot.database.load()
    const id = contact.id
    if (!bot.database.users[id]) { 
        const user = (() => { return defaults.user })()
        user.id = id
        user.uid = String(Object.keys(bot.database.users).length)
        user.profile.name.notify = contact.notify
        bot.database.users[id] = user
    } else if (bot.database.users[id]) {
        const user = bot.database.users[id]
        if (user.profile.name.notify != contact.notify) {
            user.profile.name.notify = contact.notify
        }
        const user_default = (() => { return defaults.user })()
        Object.keys(user_default).forEach(v => {
            if (!user[v]) {
                user[v] = user_default[v]
            }
        })
    }
    bot.database.save()
}
