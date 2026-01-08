export async function callback(bot, m, text): Promise<any> {
    return new Promise((resolve, reject) => {
        bot.setTimeout(reject)
        
        switch(text.args[0]) {
            case 'button': {
                bot.sendButton(
                    m.from, { buttons: [{},{},{}] }
                )
                .then(resolve)
                .catch(reject)
                break
            }
            case 'template': {
                bot.sendButton(
                    m.from, { templateButtons: [{
                        text: 'Copy me',
                        type: 'copy'
                    },{
                        text: 'Open me',
                        type: 'url'
                    },{
                        text: 'Call me',
                        type: 'call'
                    }, {
                        text: 'Press me'
                    }] }
                )
                .then(resolve)
                .catch(reject)
                break
            }
            case 'payment': {
                bot.sendRequestPayment(m.from, {
                    from: m.sender
                })
                .then(resolve)
                .catch(reject)
                break
            }
            default: {
                bot.sock.sendMessage(
                    m.from, { text: 'workass' }, { quoted: m }
                )
                .then(resolve)
                .catch(reject)
            }
        }
    })
}

export * as help from './help'

export const metadata = {
    name: "test",
    category: undefined
}

export var requirement = {
    
}

export const trigger = (/^test$/i)
