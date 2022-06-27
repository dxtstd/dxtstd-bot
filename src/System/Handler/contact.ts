import * as fs from 'fs'
import * as path from 'path'

export function ContactsHandler (contact, database) {
    database.load()
    const id = contact[0].id
    if (!database.users[id]) { 
        const user = JSON.parse(String(fs.readFileSync(path.join(__dirname, '..', '..', '..', 'assets', 'newUser.json'))))
        user.id = id
        user.uid = Object.keys(database.users).length
        user.profile.name.notify = contact[0].notify
        database.users[id] = user
    } else if (database.users[id]) {
        const user = database.users[id]
        if (user.profile.name.notify != contact[0].notify) {
            user.profile.name.notify = contact[0].notify
        }
    }
    database.save()
}