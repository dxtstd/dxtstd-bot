export async function callback(bot, m, text): Promise<any> {
    return new Promise((resolve, reject) => {
        bot.setTimeout(reject)
        
        bot.sock.sendMessage(m.from, { delete: m.quoted.key })
        .then(() => {
            m.reply({
                text: "deleted..."
            }).then(resolve)
        })
        .catch(reject)
    })
}

export * as help from './help'

export const metadata = {
    name: "delete",
    category: "utility"
}

export var requirement = {
    
}

export var status = {
    
}

export const trigger = (/^delete$/i)
