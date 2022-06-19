const cp = require("child_process");
const baileys = require("@adiwajshing/baileys")
const util = require("util")

const command = async (data) => {
    try {
        //PROCESSOR AUDIO
        processor = async function processor(
            input,
            opts,
            argsFfmpeg,
            argsSox,
            optsFfmpeg, 
            optsSox
        ) {
            return new Promise(async (resolve, reject) => {
                let resAudio = Buffer.from([]);
                input = input;
                
                opts = opts || {
                    
                };
                
                argsFfmpeg = argsFfmpeg || [
                    "-i", "-", //INPUT
                    "-f", "flac", //FORMAT
                    "-" //OUTPUT
                ];
                argsSox = argsSox || [
                    "-", //INPUT
                    "-t", "mp3", //FORMAT
                    "-" //OUTPUT
                ];
                
                //FFMPEG
                let ffmpegClose = false;
                let ffmpegstdoutClose = false;
                const ffmpeg = cp.spawn("ffmpeg", argsFfmpeg);
                
                //SOX 
                let soxClose = false;
                let soxstdoutClose = false;
                const sox = cp.spawn("sox", argsSox);
                
                //Process
                input.resume();
                input.pipe(ffmpeg.stdin);
                ffmpeg.stdout.resume();
                ffmpeg.stdout.pipe(sox.stdin);
                
                let error
                //On Exit & Close
                const exitHandler = function () {
                    if (error) {
                        
                    }
                    if (soxClose && soxstdoutClose) {
                        resolve(resAudio);
                    }
                };
               
                ffmpeg.stdout.on('close', () => {
                    ffmpegstdoutClose = false;
                    exitHandler();
                });
                ffmpeg.on('exit', () => {
                    ffmpegClose = true;
                    exitHandler();
                });
           
                sox.on('exit', () => {
                    soxClose = true;
                    exitHandler();
                });
                sox.stdout.on('close', () => {
                    soxstdoutClose = true;
                    exitHandler();
                });
            
                //Data
                sox.stdout.on("data", async (datanya) => {
                    resAudio = Buffer.concat([resAudio, datanya]);
                });
            });
        };
        
        let argsSoxEffect = [];
        let argsFfmpegEffect = [];
        const effectSox = {
            _default: [
                "-", //INPUT
                "-t", "mp3", //FORMAT
                "-" //OUTPUT
            ],
            slow: [
                "speed", "0.8"
            ],
            fast: [
                "speed", "1.3"
            ],
            deep: [
                "pitch", "-800"
            ],
            chipmunk: [
                "pitch", "800"
            ],
            bass: [
                
            ],
            reverb: [
                "pad", "0", "4",
                "gain", "-6",
                "reverb", "100", "100", "100", "100", "10", "2"
            ],
            echo: [
                "echo", "1", "0.5", "500", "0.4", "750", "0.3", "1000", "0.2", "1250", "0.1", "1500", "0.0",
            ], 
            reverse: [
              "reverse"
            ]
        };
        
        let teks;
        
        
        if (data.chat.is.quoted && data.args.join(" ")) {
            let argsSoxEffect = effectSox._default;
            let avileb = "";
            let notAvileb = [];
            for (let i in data.args) {
                if (effectSox[data.args[i].toLowerCase()]) {
                    argsSoxEffect = argsSoxEffect.concat(effectSox[data.args[i].toLowerCase()]);
                    avileb += data.args[i].toLowerCase() + " ";
                }
                else {
                    notAvileb.push(data.args[i]);
                }
            }
            
            if (notAvileb != 0) {
                teks = `Effect *"${notAvileb.join(', ')}*" is not Available`;
                client.sendMessage(data.from, { text: teks });
                return;
            } 
            
            let cQAudio = data.chat.message.quoted();
            if (cQAudio.message.type != "audioMessage") {
                teks = `The message type must be audio!`;
                client.sendMessage(data.from, { text: teks });
                return;
            } 
            const streamAudio = await baileys.downloadContentFromMessage(cQAudio.message[cQAudio.message.type], 'audio');
            let audioResult = await processor(streamAudio, {}, undefined, argsSoxEffect);
            
            client.sendMessage(data.from, { audio: audioResult, mimetype: "audio/mpeg"}, { quoted: data.chat });
        } else if (!data.chat.is.quoted && data.args.join(" ")) {
            teks = `Reply the audio...`;
            client.sendMessage(data.from, { text: teks });
            return;
        } else if (data.chat.is.quoted && !data.args[0]) {
            teks = `404 Not Found`;
            client.sendMessage(data.from, { text: teks });
            return;
        }
        
   } catch (e) {
       logger.error(e)
       client.sendMessage(data.from, {
            text: util.format(e)
        }, {
            quoted: data.chat
        })
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
command.name = 'Audio';
command.help = ['audio'].map(v => v + " *<[...effect]>*");
command.tags = ['audio'];
command.use = (/^audio?$/i);

//OPTION
command.disable = false;
command.beta = false;
command.support = {
    android: true,
    linux: true,
    windows: false
};

module.exports = command;
