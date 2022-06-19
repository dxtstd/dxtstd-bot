//PUT YOUR MODULE IN HERE ↓↓
const util = require('util')
const os = require('os')
const fs = require('fs')
const path = require('path')

const handler = async () => {
    const data = global.db.data

    const chat = data.chat
    const from = data.from
    const text = data.text
    const command = data.command
    const args = data.args
    const groupname = data.groupname
    const username = data.username

    const reply = (teks) => {
        client.sendMessage(from, teks, MessageType.text, {
            quoted: chat
        })
    }

    try {
        length = command.split("").length + 2
        konsol = text.slice(length)
        
        
        
        await reply(util.format(eval(konsol)))
    } catch (e) {
        reply(`ERROR: ${util.format(e)}`)
        logger.error(e)
    }
    /*
    //eval return
    if (budy.startsWith('<')) {
        if (!vnz.key.fromMe) return
        if (!isOwner) return
        console.log('[', color('EVAL', 'silver'), ']', color(moment(vnz.messageTimestamp * 1000).format('DD/MM HH:mm:ss'), 'yellow'), color(budy))
        try {
            return reply(JSON.stringify(eval(budy.slice(2)), null, '\t'))
        } catch(e) {
            reply(`${e}`)
        }
    }
    // eval async
    if (budy.startsWith('>')) {
        if (!vnz.key.fromMe) return
        if (!isOwner) return
        var konsol = budy.slice(2)
        Return = (sul) => {
            var sat = JSON.stringify(sul, null, 2)
            bang = util.format(sat)
            if (sat == undefined) {
                bang = util.format(sul)
            }
            return reply(bang)
        }
        try {
            reply(util.format(eval(`;(async () => { ${konsol} })()`)))
            console.log('[', color('EVAL', 'silver'), ']', color(moment(vnz.messageTimestamp * 1000).format('DD/MM HH:mm:ss'), 'yellow'), color(budy))
        } catch(e) {
            reply(String(e))
        }
    }
    */
}

handler.disable = false

handler.help = false
if (handler.help) {
    handler.title = ''
    handler.description = ''
    handler.usage = ''
}

handler.owner = true
handler.private = false
handler.admin = false
handler.group = false

handler.tag = ''
handler.command = [`eval`, `node`, `ev`]

module.exports = ev = handler