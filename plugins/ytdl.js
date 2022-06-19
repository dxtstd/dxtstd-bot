//PUT YOUR MODULE IN HERE ↓↓↓
const ytdl = require("ytdl-core")
const yts = require("yt-search")
const ffmpeg = require("fluent-ffmpeg")
const moment = require('moment-timezone')
const fs = require("fs")
const path = require("path")
const util = require("util")

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

    const intToString = function (value) {
        skala = ["", "K", "M", "B", "T", "P"]
        parameter = 0
        while(value > 999) {
            value = Math.floor(value / 1000).toFixed(1)
            parameter ++
        }
        return value + skala[parameter]
    }

    const URLvalid = function(url) {
        const REGEX = /(https?:\/\/|)(www\.|m\.|)?(youtu\.|youtube\.)?(be|com)/;
        if (!url || typeof url !== "string") return false;
        return REGEX.test(url);
    }

    const WEBvalid = function(url) {
        const REGEX = /(https?:\/\/|http?:\/\/|)(www\.)/;
        if (!url || typeof url !== "string") return false;
        return REGEX.test(url);
    }

    try {
        let linkyt
        let searchType

        if (args < 1) return reply('Link/keyword tidak boleh kosong')

        if (URLvalid(args[0])) {
            linkyt = args[0]
            searchType = 'Link'
        } else if (args.length != 0 && !WEBvalid(args.join(' '))) {
            linkyt = await yts(args.join(' ', '\n'))
            linkyt = linkyt.all[0].url
            searchType = 'Keyword'
        } else return reply('Link/keyword tidak invalid')

        const ytInfo = await ytdl.getInfo(linkyt)
        const info = ytInfo.videoDetails
        if (info.lengthSeconds > 900) {
            return reply('Video tidak boleh di atas 15 menit')
        }

        info.lengthSeconds = moment.tz('Asia/Makassar').startOf('day').seconds(info.lengthSeconds).format('mm:ss')

        author = info.author

        let titleVid = info.title
        if (info.title.length > 30) {
            titleVid = info.title.substr(0, 35) + "..."
        }

        let teeks = `*${botname}*`
        + `\n` + `*${command.toUpperCase()} Downloader*`
        + `\n` + `*Search Type:* ${searchType}`
        + `\n` + `note: menggunakan ytdl-core & ffmpeg, jadi mohon bersabar`
        + `\n`
        + `\n` + `*_Channel Details:_* `
        + `\n` + `*Name:* ${author.name}`
        + `\n` + `*URL:* ${author.channel_url}`
        + `\n` + `*Subscriber:* ${intToString(author.subscriber_count) || NaN}`
        + `\n`
        + `\n` + `*_Video Details:_* `
        + `\n` + `*Title:* ${titleVid}`
        + `\n` + `*Duration:* ${info.lengthSeconds}`
        + `\n` + `*Viewers:* ${intToString(info.viewCount)}`
        + `\n` + `*Upload Date:* ${info.uploadDate}`
        + `\n` + `*Like:* ${intToString(info.likes)}`
        + `\n` + `*Dislike:* ${intToString(info.dislikes)}`
        + `\n` + `*Description:* ${readmore}${info.description}`

        let imgFile = getRandom('.png')
        const dir = tmp(imgFile)
        var thumb = info.thumbnails.length - 1
        let image = await getBuffer(info.thumbnails[thumb].url)
        await fs.writeFileSync(dir, image)
        image = fs.createReadStream(dir)

        ffmpeg(image)
        .save(dir)
        .on('end', async () => {
            var thumbnail = await fs.readFileSync(dir)
            await client.sendMessage(from, thumbnail, MessageType.image, {
                caption: teeks,
                mimetype: 'image/png'
            })
        })


        switch (command) {
            case 'ytmp3':
                stream = await ytdl(linkyt, {
                    quality: 'highestaudio',
                }); // HERE THE STREAM FILE IS SELECTED TO BE CONVERTED TO MP3

                var audioFile = getRandom('.mp3')
                var filePath = tmp(audioFile)
                ffmpeg(stream)
                .audioBitrate(160)
                .save(filePath) // HERE IS CONVERTED AND WHERE I WANT IT TO SEND IT AS A DOWNLOAD TO THE USER.
                .on('end', async () => {
                  var music = await fs.readFileSync(filePath)
                    await client.sendMessage(from, music, MessageType.audio, {
                        quoted: chat, mimetype: 'audio/mpeg', mp3: true
                    })
                })
                break
            case 'ytmp4':
                stream = await ytdl(linkyt, {
                    quality: 'highest',
                }); // HERE THE STREAM FILE IS SELECTED TO BE CONVERTED TO MP3

                var audioFile = getRandom('.mp4')
                var filePath = tmp(audioFile)
                ffmpeg(stream)
                .fps(30)
                .audioBitrate(160)
                .save(filePath) // HERE IS CONVERTED AND WHERE I WANT IT TO SEND IT AS A DOWNLOAD TO THE USER.
                .on('end', async () => {
                    var video = await fs.readFileSync(filePath)
                    await client.sendMessage(from, video, MessageType.video, {
                        quoted: chat, mimetype: 'video/mp4'
                    })
                })
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
handler.command = [`ytmp3`,'ytmp4']

module.exports = handler