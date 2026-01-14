import { Bot } from "../System/init"

export async function callback(this: Bot, m): Promise<any> {
    return new Promise((resolve, reject) => {
        this.setTimeout(reject)
        
        m.reply({ text: "workas" })
        .then(resolve)
        .catch(reject)
    })
}
export const trigger = (/^test$/i)

export const metadata = {
    name: "test",
    category: "utility",
    description: "this is test!"
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
