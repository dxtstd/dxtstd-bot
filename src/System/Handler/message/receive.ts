import * as util from 'util'
import * as anti from '../anti'

export async function receive (bot, m): Promise<void> {
    console.log('Received message...', m)
    
    if (m.text.command) {
        bot.events.emit('command.text', m)
    }
    if (m.type == 'buttonsResponseMessage') {
        bot.events.emit('command.button.respond', m)
    } else if (m.type == 'templateButtonReplyMessage') {
        bot.events.emit('command.button.respond', m)
    }
    
    Object.keys(anti).forEach(type => {
        bot.events.emit(('anti.%type%'.replace('%type%', type)), m)
    })
}