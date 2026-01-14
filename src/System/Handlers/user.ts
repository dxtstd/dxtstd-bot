import { Bot } from "../init"
import * as types from "../../Types"
import * as defaults from "../../Defaults"

export async function updateDatabase (this: Bot, contact): Promise<void> {
    const jid = contact.id
    if (!jid) return
    
    const doc_user: types.database.data = await this.database.read("users", jid)
    const JSONUser = {
        ...defaults.user,
        uid: String((await this.database.users.allDocs()).total_rows),
        ...doc_user,
    }
    JSONUser.id = jid
    JSONUser.profile.name.notify = contact.notify

    

    return await this.database.write("users", jid, JSONUser)
}