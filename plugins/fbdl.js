/*
PLUGIN FBDL by DentaCH
jangan dihapus wm nya, capek anjir bikin ginian doang
SALAM PROGAMMER BOT

*/


//PUT YOUR MODULE IN HERE ↓↓↓
const util = require('util')
const path = require('path')
const fbdl = require(path.join(__dirname, "..", "/lib/", "fbdl"))
const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')

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
        if (args[0].includes('groups')) return reply('Group Tidak Didukung!')
        reply('waitos')
        hasil = await fbdl.getInfo(args[0])
        
        if (hasil == undefined) {
            return reply('ERROR')
        }
        
        teks = `*${botname}*`
        + `\n` + `FB DOWNLOADER`
        + `\n` + `\n` + `Title: ${hasil.title}`
        + `\n` + `Uploader: ${hasil.author.name}`
        + `\n` + `Type: ${hasil.type}`
        + `\n` + `Text: ${readmore}${hasil.text}`
        
        switch (hasil.type) {
            case 'image':
                imgUrl = hasil.file.image[0].contentUrl
                let ini_img
                ini_img = await getBuffer(imgUrl)
                reply(teks)
                await client.sendMessage(from, ini_img, MessageType.image, { quoted: chat, mimetype: 'image/png' })
                break
            case 'video':
                vidUrl = hasil.file.video
                ini_vid = await getBuffer(vidUrl)
                reply(teks)
                await client.sendMessage(from, ini_vid, MessageType.video, { quoted: chat, mimetype: 'video/mp4' })
                break
            case 'text':
                reply(teks)
                break
            default:
            
        }
        
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

handler.tag = `downloader`
handler.command = [`fb`]

module.exports = handler