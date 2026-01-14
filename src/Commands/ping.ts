import { Bot } from "../System/init"
import * as types from "../Types"

import * as util from "util";

export async function callback(this: Bot, m: types.message): Promise<any> {
    return new Promise((resolve, reject) => {
        this.setTimeout(reject)
        
        const before_ping = Date.now()/1000
        m.reply({ text: '_testing..._' })
        .then((mm) => {
            const after_ping = Date.now()/1000
            const result_ping = after_ping - before_ping
            const text = `[ *PING* ]` +`\n`
                       + `Receive: ${(before_ping-(m.messageTimestamp as number)).toFixed(3)}s` + `\n`
                       + `Sending: ${(result_ping).toFixed(3)}s` + `\n`
                       + `Total: ${((result_ping) + (before_ping-(m.messageTimestamp as number))).toFixed(3)}s`
                       
            mm.edit({ text })
            .then(resolve)
            .catch(reject)
        }).catch(reject)
    })
}
export const trigger = (/^ping$/i)

export const metadata = {
    name: "ping",
    category: "utility",
    description: "check speed this bot :O"
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
        verified: true
    }
}

export const status = {
    beta: false,
    legacy: false,
    disable: false
}

export function help(type) {
    
}
