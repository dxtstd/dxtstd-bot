//PUT YOUR MODULE IN HERE ↓↓↓
const util = require('util')
let cp = require('child_process')
let { promisify } = require('util')
let exec = promisify(cp.exec).bind(cp)

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
    let hasil
    try {
        hasil = await exec(args.join(" "))
    } catch (e) {
        logger.error(e)
        hasil = e
    } finally {
        if (hasil.stderr) reply(`${util.format(hasil.stderr)}`)
        if (hasil.stdout) reply(`${util.format(hasil.stdout)}`)
        
    } 
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

handler.command = [`exec`, `term`, `ex`]

module.exports = handler