import * as types from '../../Types'

import * as util from 'util'

export async function execute (bot, m, exec) {
    bot.commands.load()
    const text = bot.fetchText(exec)
    const commands = bot.commands
    let command = (Object.values(commands.uncategory)
    .filter(cmd => {
        return (cmd as types.command.ICommand).trigger?.test(text.command)
    })[0] ||
    Object.keys(commands.category).map(category => {
        return Object.values(commands.category[category]).filter(cmd => {
            return (cmd as types.command.ICommand).trigger?.test(text.command)
        })[0]
    })
    .filter(cmd => { return cmd })[0] || {}) as types.command.ICommand
    
    if (!command.callback) return void 0
    if (command.requirement.admin?.bot && !m.user.is.admin.bot) return void m.reply
    
    return command.callback(bot, m, text)
    .catch(error => {
        m.reply({ text: util.format(error) })
        //bot.sock.sendMessage()
        bot.logger.error(error)
        
        return void 0
    })
}

function buttonRespond (bot, m) {
    bot.database.load()
    
    const buttonResponse = bot.database.response.button[m.quoted?.key.id]
    if (!buttonResponse) return
    
    const buttonId = (m.message[m.type].selectedButtonId || m.message[m.type].selectedId)
    const valueButton = buttonResponse?.buttons[buttonId]
    if (!!valueButton) {
        if (valueButton.pressed) return
        valueButton.pressed = true
        bot.database.response.button[m.quoted?.key.id].buttons[buttonId] = valueButton

        bot.events.emit('command.execute', m, valueButton.command)
        if (buttonResponse.onceRespond) {
            delete bot.database.response.button[m.quoted?.key.id]
        } else {
            const pressednt = Object.keys((buttonResponse?.buttons||{})).filter(hashId => {
                return (!buttonResponse?.buttons[hashId].pressed)
            })
            
            if (!pressednt[0]) {
                delete bot.database.response.button[m.quoted?.key.id]
            }
        }
    }
    bot.database.save()
}

export const button = {
    respond: buttonRespond
}

export function text (bot, m) {
    bot.events.emit('command.execute', m, m.text.full)
}