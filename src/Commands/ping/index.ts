export async function callback(bot, m, text): Promise<any> {
    return new Promise((resolve, reject) => {
        bot.setTimeout(reject)
        
        const before_ping = Date.now()/1000
        bot.sock.sendMessage(m.from, { text: '_testing..._' })
        .then(res => {
            const after_ping = Date.now()/1000
            const result_ping = after_ping - before_ping
            const text = `[ *PING* ]` +`\n`
                       + `Receive: ${(before_ping-m.messageTimestamp).toFixed(3)}s` + `\n`
                       + `Sending: ${(result_ping).toFixed(3)}s` + `\n`
                       + `Total: ${((result_ping) + (before_ping-m.messageTimestamp)).toFixed(3)}s`
                       
            m.reply({ text })
            .then(resolve)
            .catch(reject)
        }).catch(reject)
    })
    
}

export * as help from './help'

export const metadata = {
    name: "ping",
    category: undefined
}

export var requirement = {
    
}

export const trigger = (/^ping$/i)
