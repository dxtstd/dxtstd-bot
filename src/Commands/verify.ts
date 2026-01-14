import { Bot } from "../System/init"
import * as types from "../Types"

export async function callback(this: Bot, m: types.message): Promise<any> {
    return new Promise((resolve, reject) => {
        this.setTimeout(reject)
        
        /** REQUIRE ARGS
         * args[0]: name
         */
        if (m.user.status.verified) {
            return m.reply({ text: `umm... you have been verified :'` })
                            .then(resolve).catch(reject)
        }

        var [ name_profile ] = m.text.args
        if (!name_profile) { 
            return m.reply({ text: `We need your name (example: ${m.text.prefix}verify ${this.sock.user.name})` })
                            .then(resolve).catch(reject)
        }
        
        m.user.status.verified = true;
        m.user.profile.name.contact = name_profile;
        this.database.write("users", m.user.id, m.user).then(() => {
            m.reply({ text: "Successful verify!" })
            .then(resolve).catch(reject)
        }).catch(reject)
    })
}
export const trigger = (/^verify$/i)

export const metadata = {
    name: "verify",
    category: "",
    description: "for verify people..."
}

export const requirement = {
    cash: 0,
    level: 0,
    premium: false,
    user: {
        admin: {
            bot: false,
            group: {
                super: false,
                normal: false
            }
        },
        owner: false,
        verified: false
    }
}

export const status = {
    beta: false,
    legacy: false,
    disable: false
}

export function help(type) {
    
}
