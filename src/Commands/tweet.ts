import { Bot } from "../System/init"
import * as utils from "../Utils"

export async function callback(this: Bot, m): Promise<any> {
    return new Promise((resolve, reject) => {
        this.setTimeout(reject, 360*1000)
        if (!m.text.args[0]) 
            return m.reply({ text: "no url?" })
            .then(resolve)
            .catch(reject);
        
        utils.tweet(m.text.args[0])
        .then(image => {
            m.reply({
                image
            })
            .then(resolve)
            .catch(reject)
        })
        .catch(reject);
    })
}

export const trigger = (/^tweet$/i)

export const metadata = {
    name: "tweet",
    category: "utility",
    description: "this is tweet!"
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
