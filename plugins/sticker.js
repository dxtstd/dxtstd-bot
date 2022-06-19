//PUT YOUR MODULE IN HERE ↓↓↓
const util = require("util")
const path = require("path")
const fs = require('fs')
const ffmpeg = require("fluent-ffmpeg")


const handler = async () => {
    const data = global.db.data

    const chat = data.chat
    const type = data.type
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
        dir = path.join(__dirname, "..", "/tmp/", getRandom(".webp"))

        sticker = await client.downloadMediaMessage(chat, "stream")
        const size = {
            height: 64,
            width: 64
        }
        if (type === MessageType.image) {
            size.height = chat.message.imageMessage.height / 4
            size.width = chat.message.imageMessage.width / 4
        } else if (type === MessageType.video) {
            size.height = chat.message.videoMessage.height / 4
            size.width = chat.message.videoMessage.width / 4
        } else if (type === MessageType.gif) {
            size.height = chat.message.gifMessage.height / 4
            size.width = chat.message.gifMessage.width / 4
        }

        await ffmpeg(sticker)
        .inputFPS(20)
        .fps(20)
        .size(`${size.width}x${size.height}`)
        .videoCodec("libwebp")
        .save(dir)
        .on('end', async () => {
            sticker = await fs.readFileSync(dir)
            await client.sendMessage(from, sticker, MessageType.sticker, {
                mimetype: "image/webp",
                isAnimated: true,
                contextInfo: {
                    width: size.width,
                    height: size.height
                }
            })
        })

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

handler.tag = `utility`
handler.command = [`sticker`]

module.exports = handler