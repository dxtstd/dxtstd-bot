import * as call from './call'
import { message } from './message'

export function setListener (bot) {
    // Event Baileys
    bot.sock.ev.on('messages.update', (arg) => {
        console.log(arg)
    })
    bot.sock.ev.on('messages.upsert', message.bind(bot))
    
    /*
    bot.sock.ev.on('creds.update', () => {
        bot.database.load()
        bot.database.auth = bot.sock.authState
        bot.database.save()
    })
    */

    // Event WebSocket
    bot.sock.ws.on('CB:call', call.reject.bind(bot))
}