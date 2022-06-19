const ytdl = require('ytdl-core')
const NodeID3 = require('node-id3')
const cp = require('child_process')
const util = require('util')
const fs = require('fs')
const fetcher = require('../lib/fetcher.js')
const yts = require('yt-search')

const URL = function (url) {
     return /https?:\/\/(www\.)?youtube/.test(url)
}

const command = async (data) => {
    try {
        const format = {
            mp3: "mp3",
            mp4: "mp4",
            audio: "mp3",
            video: "mp4"
        }
        
        if (format[data.args[0]]) {
            let linkYT = (data.args).slice(1)
            
            if (!URL(linkYT)) {
                let result = await yts(linkYT.join(" "))
                linkYT = result.all[0].url
            } else linkYT = linkYT[0]
            if (!linkYT) return
            
            const ytInfo = await ytdl.getInfo(linkYT)
            let info = ytInfo.videoDetails
        
            var thumb = info.thumbnails.length - 1
            let image = await fetcher.getBuffer(info.thumbnails[thumb].url)
            await fs.writeFileSync(dir.tmp + info.videoId + '.webp', image)
            await cp.spawnSync('ffmpeg', ['-i', `${dir.tmp}${info.videoId}.webp`, `${dir.tmp}${info.videoId}_0.webp`], { stdio: 'pipe' })
            await fs.unlinkSync(dir.tmp + info.videoId + '.webp')
            
            let tmpAudio = dir.tmp + new Date() + ".mp3"
            let tmpVideo = dir.tmp + new Date() + ".mp4"
            
            const tags = {
                TIT2: info.title,
                TPE1: info.author.name,
                TPUB: info.author.name,
                TALB: info.author.name,
                TENC: 'FFMPEG',
                TFLT: 'audio',
                WOAF: linkYT,
                APIC: fs.readFileSync(`${dir.tmp}${info.videoId}_0.webp`)
            }

            let ctx = {
                externalAdReply: {
                    matchedText: linkYT,
                    canonicalUrl: linkYT,
                    sourceUrl: linkYT,
                    previewType: 2,
                    title: info.title,
                    description: "description...",
                    thumbnail: fs.readFileSync(`${dir.tmp}${info.videoId}_0.webp`)
                }
            }
            
            await fs.unlinkSync(dir.tmp + info.videoId + '_0.webp')
        
            if (format[data.args[0]] == "mp3") {
                const ffmpeg = cp.spawn("ffmpeg", [
                    "-i", "pipe:0",
                    "-c", "mp3",
                    "-f", "mp3",
                    `${tmpAudio}`,
                    "-y"
                ], { stdio: "pipe"})
                
                const audioStream = await ytdl(linkYT, { quality: 'highestaudio' })
                audioStream.resume()
                audioStream.pipe(ffmpeg.stdio[0])
                
                let error
                //On Exit & Close
                const exitHandler = async function () {
                    if (ffmpegClose) {
                        let audioFile = fs.readFileSync(tmpAudio)
                        audioFile = NodeID3.write(tags, audioFile)
                        await client.sendMessage(data.from, { audio: audioFile, mimetype: "audio/mpeg", contextInfo: ctx }, { quoted: data.chat })
                        fs.unlinkSync(tmpAudio)
                    }
                };
                
                ffmpeg.on('exit', () => {
                    ffmpegClose = true;
                    exitHandler();
                });
            }
            
            if (format[data.args[0]] == "mp4") {
                let videoTag;
                let audioTag;
                await ytInfo.formats.forEach(v => {
                    //if (!videoTag && v.itag == 137) videoTag = v.itag //1080p
                /*else*/ if (!videoTag && v.itag == 136) videoTag = v.itag //720p
                    else if (!videoTag && v.itag == 135) videoTag = v.itag //480p
                    else if (!videoTag && v.itag == 134) videoTag = v.itag //360p
                    else if (!videoTag && v.itag == 133) videoTag = v.itag //240p
                    else if (!videoTag && v.itag == 160) videoTag = v.itag //144p
                })
                
                const audioStream = await ytdl(linkYT, { quality: 'highestaudio' })
                const videoStream = await ytdl(linkYT, { quality: videoTag })
                
                let ffmpegClose = false;
                let ffmpegstdoutClose = false;
                const ffmpeg = cp.spawn('ffmpeg', [
                 "-i", "pipe:3",
                 "-i", "pipe:4",
                 "-b:a", "128k",
                 "-c:v", "copy",
                 "-c:a", "mp3",
                 "-map", "0:v:0",
                 "-map", "1:a:0",
                 "-f", "mp4",
                 `${tmpVideo}`,
                 "-y"
                 ], { stdio: ['ignore', 'pipe', 'pipe', 'pipe', 'pipe'] })
                
                audioStream.resume()
                videoStream.resume()
                
                audioStream.pipe(ffmpeg.stdio[4])
                videoStream.pipe(ffmpeg.stdio[3])
    
                let error
                //On Exit & Close
                const exitHandler = async function () {
                    if (error) {
                        
                    }
                    if (ffmpegClose) {
                        await client.sendMessage(data.from, { video: fs.readFileSync(tmpVideo), contextInfo: ctx }, { quoted: data.chat })
                        fs.unlinkSync(tmpVideo)
                    }
                };
                
                ffmpeg.on('exit', () => {
                    ffmpegClose = true;
                    exitHandler();
                });
            } else {
                
            }
        }
    } catch (e) {
        logger.error
        client.sendMessage(data.from, {
            text: util.format(e)
        }, {
            quoted: data.chat
        })
    }
}

//PERMISSION
command.permission = {
    owner: false,
    admin: {
        bot: false,
        normal: false,
        super: false
    },
    premium: false,
    group: false,
    private: false
};
//NEED
command.need = {
    verified: true,
    limit: {
        amount: 0
    },
    cash: {
        amount: 0
    },
    level: 0
};
//INFO
command.name = '';
command.help = ['youtubedl'].map(v => v + " *<format>* *<[keyword|link]>*");
command.tags = ['downloader'];
command.use = (/^(yt|youtube)(dl)$/);

//OPTION
command.disable = false;
command.beta = false;
command.support = {
    android: true,
    linux: true,
    windows: false
};

module.exports = command;