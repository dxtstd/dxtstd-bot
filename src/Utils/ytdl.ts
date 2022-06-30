import { MakeTMPFile, MakeTMPFolder } from './tmp'
import * as fetcher from './fetcher'

import * as moment from 'moment-timezone'
import * as NodeID3 from 'node-id3'
import ytdl from 'ytdl-core'

import * as fs from 'fs'
import { spawn } from 'child_process'

interface InfoYTVideo {
    name: string;
    description: string;
    author: string;
    duration: string;
    views: string;
    like: string|number;
    resolution: string;
    filesize: {
        audio: string;
        video: string;
    };
    tag: {
        audio: string;
        video: string;
    },
    url: {
        thumbnail: string;
        original: string;
        video: string;
        audio: string;
    }
}

const Filesize = function (bitrate: number, duration: number): string {
    return String(((((bitrate / 10) * (duration)) / 1000) / 1000).toFixed(2)) + " MB"
}

const ResolutionVideo = {

    "160": "144p",
    "133": "240p",
    "134": "360p",
    "135": "480p",
    "136": "720p",
  "137": "1080p",
    "0": "0" 
}

const BitrateAudio = {
    "249": "48",
    "250": "64",
    "140": "128",
    "251": "160",
    "0": "0"
}

const GetInfo = async function (link): Promise<InfoYTVideo> {
    let TagVideo;
    let TagAudio;
    const InfoVideo = await ytdl.getInfo(link)
    
    const Formats = {};
    InfoVideo.formats.forEach(format => {
        Formats[format.itag] = format;
        if ((!TagVideo) && ResolutionVideo[format.itag]) TagVideo = format.itag;
        if ((!TagAudio) && BitrateAudio[format.itag]) TagAudio = format.itag;
    })
    
    return {
        name: InfoVideo.videoDetails.title,
        description: InfoVideo.videoDetails.description,
        author: InfoVideo.videoDetails.author.name,
        duration: moment.tz().startOf('day').seconds(Number(InfoVideo.videoDetails.lengthSeconds)).format("HH:mm:ss"),
        views: InfoVideo.videoDetails.viewCount,
        like: InfoVideo.videoDetails.likes,
        resolution: ResolutionVideo[TagVideo],
        filesize: {
            audio: Filesize(Formats[TagAudio].bitrate, Number(InfoVideo.videoDetails.lengthSeconds)),
            video: Filesize(Formats[TagVideo].bitrate, Number(InfoVideo.videoDetails.lengthSeconds))
        },
        tag: {
            audio: TagAudio,
            video: TagVideo
        },
        url: {
            thumbnail: InfoVideo.videoDetails.thumbnails.reverse()[0].url,
            original: link,
            audio: Formats[TagAudio].url,
            video: Formats[TagVideo].url
        }
    }
}

const mp3 = async function (
    link: string, output?: string
): Promise<any> {
    const InfoVideo = await GetInfo(link);
    const AudioStream = await fetcher.getStream(InfoVideo.url.audio)
    
    const result = await new Promise(async (res, rej) => {
        try {
            const filename = MakeTMPFile('.mp3')
            const ffmpeg = spawn('ffmpeg', ['-i', 'pipe:3', '-f', 'mp3', filename], {
                stdio: ['pipe', 'pipe', 'pipe', 'pipe']
            })
            let FfmpegBuffer: Buffer = Buffer.from([])
            let FfmpegBufferErr: Buffer = Buffer.from([])
            let FfmpegBufferOut: Buffer = Buffer.from([])
            
            AudioStream.resume()
            AudioStream.pipe(ffmpeg.stdio[3])
            
            ffmpeg.on('exit', async (...exit) => {
                if (exit[0] != 0) {
                    const error = `\n\tFFMPEG: ${String(FfmpegBufferErr)}\n${String(FfmpegBufferOut)}`
                    rej(new Error(error))
                }
                if (fs.existsSync(filename)) {
                    const audio = await fs.readFileSync(filename)
                    fs.unlinkSync(filename)
                    res(audio)
                }
            })
            
            ffmpeg.stdio[1].on('data', (...data) => {
                if (data[0]) {
                    FfmpegBuffer = Buffer.concat([FfmpegBuffer, data[0]])
                }
            })
            
            
            ffmpeg.stdio[2].on('data', (...data) => {
                if (data[0]) {
                    FfmpegBufferErr = Buffer.concat([FfmpegBufferErr, data[0]])
                }
            })
            
        } catch (error) {
            rej(error)
        }
    }) as Buffer
    
    const tags: any= {
        TIT2: InfoVideo.name,
        TPE1: InfoVideo.author,
        TPUB: InfoVideo.author,
        TALB: InfoVideo.author,
        TENC: 'FFMPEG',
        WOAF: InfoVideo.url.original,
        APIC: await fetcher.getBuffer(InfoVideo.url.thumbnail)
    }
    const audio = await NodeID3.write(tags, result)
    return audio
}

const mp4 = async function (link) {
    /* */
}

export {
    GetInfo,
    mp3,
    mp4
}