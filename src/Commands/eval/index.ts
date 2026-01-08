import * as util from 'util'

export async function callback(bot, m, text): Promise<any> {
    return new Promise((resolve, reject) => {
        bot.setTimeout(reject)
        
        let a = (async () => {
            return await eval(m.text.body)
        })()
        .then(res => {
            m.reply({ text: util.format(res) })
            .then(resolve)
        })
        .catch(reject)
    })
}

export * as help from './help'

export const metadata = {
    name: "eval",
    category: "owner"
}

export var requirement = {
    admin: {
        bot: true
    }
}

export const trigger = (/^>$/i)
