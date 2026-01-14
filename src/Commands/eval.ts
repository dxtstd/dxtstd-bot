import { Bot } from "../System/init"

import * as util from "util";

export async function callback(this: Bot, m): Promise<any> {
    return new Promise((resolve, reject) => {
        this.setTimeout(reject);
        
        const evalu = (async() => { return await eval(m.text.body)})
        let result;
        evalu()
        .then(res => result = res)
        .catch(res => result = res)
        .finally(() => {
            m.reply({ text: util.format(result) })
            .then(resolve)
            .catch(reject)
        })
    })
}
export const trigger = (/^>|ev(al)?$/i)

export const metadata = {
    name: "eval",
    category: "owner",
    description: "for purposed use owner"
}

export const requirement = {
    cash: 0,
    level: 0,
    premium: false,
    user: {
        admin: {
            bot: true,
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
