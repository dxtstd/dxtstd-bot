//PUT YOUR MODULE IN HERE ↓↓↓
const util = require('util')

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
        reply('workas')
    } catch (e) {
        reply(`ERROR: ${util.format(e)}`)
        logger.error(e)
    }
}

handler.disable = false

handler.help = false
if (handler.help) {
    handler.title = ''
    handler.description = ''
    handler.usage = ''
}

handler.owner = false
handler.private = false
handler.admin = false
handler.group = false

handler.tag = ''
handler.command = [`test`, `tes`, `t`]

module.exports = handler