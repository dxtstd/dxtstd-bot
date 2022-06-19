const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const baileys = require("@adiwajshing/baileys");
const cp = require("child_process");
const util = require('util');


const getRandom = () => {
    return `${Math.floor(Math.random() * 10000)}`;
};

const command = async (data) => {
    try {
        var isQuoted = /extendedText/.test(data.type) ? true: false;

        let stream;
        if (isQuoted) {
            data.type = Object.keys(data.chat.message.extendedTextMessage.contextInfo.quotedMessage)[0];
            if (/video/.test(data.type)) {
                stream = await baileys.downloadContentFromMessage(data.chat.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage, 'video');
            } else if (/image/.test(data.type)) {
                stream = await baileys.downloadContentFromMessage(data.chat.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage, 'image');
            } else {
                client.sendMessage(data.from, {
                    text: "Input harus berupa media Gambar/Video!"
                }, {
                    quoted: data.chat
                });
                return;
            }
        } else if (!isQuoted) {
            if (/image/.test(data.type)) {
                stream = await baileys.downloadContentFromMessage(data.chat.message.imageMessage, 'image');
            } else if (/video/.test(data.type)) {
                stream = await baileys.downloadContentFromMessage(data.chat.message.videoMessage, 'video');
            } else {
                client.sendMessage(data.from, {
                    text: "Reply/Kasih Caption Gambar/Video!!"
                }, {
                    quoted: data.chat
                });
                return;
            }
        }
        
        const processor = async function processor(input, argsFfmpeg) {
            return new Promise(async (resolve, reject) => {
                try { 
                let resStc = Buffer.from([]);
                let stdErr = Buffer.from([]);
                let ffmpegClose = false;
                let ffmpegstdoutClose = false;
                const ffmpeg = cp.spawn('ffmpeg', argsFfmpeg);
                input.resume();
                input.pipe(ffmpeg.stdin);
                
                let error;
                //On Exit & Close
                const exitHandler = function () {
                    if (error) {
                        
                    }
                    if (ffmpegClose && ffmpegstdoutClose) {
                        resolve(resStc);
                    }
                };
                
                ffmpeg.stdout.on('close', () => {
                    ffmpegstdoutClose = true;
                    exitHandler();
                });
                
                ffmpeg.on('exit', () => {
                    ffmpegClose = true;
                    exitHandler();
                });
                /*
                ffmpeg.stderr.on('data', (datanya) => {
                    input.pause()
                    stdErr = Buffer.concat([stdErr, datanya])
                })
                
                ffmpeg.stderr.on('close', () => {
                    if (stdErr.toString().match(/ffmpeg exited with code/)) {
                        logger.error(stdErr.toString())
                        reject(stdErr.toString())
                    }
                })
                */
                //Data
                ffmpeg.stdout.on("data", async (datanya) => {
                    resStc = Buffer.concat([resStc, datanya]);
                });
                } catch (e) {
                    reject(e);
                }
            }); 
        };
        
        const addExif = async function (webpBuffer, exifJson) {
            const webp = require('node-webpmux'); // Optional Feature;
            const img = new webp.Image();
            let exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
            let jsonBuffer = Buffer.from(JSON.stringify(exifJson), 'utf8');
            let exif = Buffer.concat([exifAttr, jsonBuffer]);
            exif.writeUIntLE(jsonBuffer.length, 14, 4);
            await img.load(webpBuffer);
            img.exif = exif;
            return await img.save(null);
        };
        
        let json;
        const stickerPackId = crypto.randomBytes(32).toString('hex');
        if (data.args[0]) {
            json = { 'sticker-pack-id': stickerPackId, 'sticker-pack-name': data.args.join(' '), 'sticker-pack-publisher': `${global.db.users[data.sender].profile.name.notify} | dxtstd-bot`};
        } else {
            json = { 'sticker-pack-id': stickerPackId, 'sticker-pack-name': global.db.users[data.sender].profile.name.notify, 'sticker-pack-publisher': 'dxtstd-bot'};
        }
        const fileTmp = dir.tmp + (new Date() + '.webp');
        let argsFfmpeg = {
            header: [
                '-i', 'pipe:0',
                '-vf', 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1'
            ],
            output: [
                fileTmp
            ]
        };
        
        const argsu = argsFfmpeg.header.concat(argsFfmpeg.output);
        await processor(stream, argsu);
        const webp = await addExif(await fs.readFileSync(fileTmp), json);
        await fs.unlinkSync(fileTmp);
        client.sendMessage(data.from, {
            sticker: webp, mimetype: 'image/webp'
        }, {
            quoted: data.chat
        });
    } catch (e) {
        logger.error(e);
        client.sendMessage(data.from, {
            text: util.format(e)
        }, {
            quoted: data.chat
        });
    }
};


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
command.name = 'sticker';
command.help = ['sticker'].map(v => v + " *<[R:image|video]|[image|video]> ([...text])*");
command.tags = ['main'];
command.use = (/^s(tic?ker)?(wm)?(gif)?$/i);

//OPTION
command.disable = false;
command.beta = false;
command.support = {
    android: true,
    linux: true,
    windows: false
};

module.exports = command;