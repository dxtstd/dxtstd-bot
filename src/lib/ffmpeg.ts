import { spawn } from "child_process"
import * as fs from "fs"

import { MakeTMPFile } from "./tmp"

const OptsFFMpeg = function () {
    return {
        args: {
            input: ['-hide_banner', '-i', 'pipe:0'],
            effect: [],
            output: [],
            result: function (this: any) {
                if (this.effect != 0) {
                    let res = this.effect.join(',')
                    return this.input.concat('-filter_complex' , res, this.output)
                } else return this.input.concat(this.output)
            }
        }
    } as any
}

const processor = async function (input: any, opts: any) {
    let output;
    if (opts.args.output.reverse()[0] == '-' || opts.args.output.reverse()[0] == 'pipe:1') output = "stream"
    else output = "file"
    try {
        const result = await new Promise(async (resolve, reject) => {
            if (!input._readableState) return reject(new Error('The input must be a stream!'));
            
            const ffmpeg = spawn('ffmpeg', opts.args.result())
            let DataFFMpegStdErr = Buffer.from([])
            let DataFFMpegStdOut = Buffer.from([])
            let ffmpegClose;
            let ffmpegCodeExit;
            
            input.resume()
            input.pipe(ffmpeg.stdio[0])
            ffmpeg.stdio[2].on('data', (data) => {
                DataFFMpegStdErr = Buffer.concat([DataFFMpegStdErr, data])
            })
            
            const exitHandler = function () {
                if (ffmpegCodeExit != 0) {
                    const error = `\n\tFFMPEG: ${String(DataFFMpegStdErr)}`
                    reject(new Error(error))
                }
                
                if (ffmpegClose) {
                    if (output == "stream") {
                        resolve(DataFFMpegStdOut)
                    } else if (output == "file") {
                        if (fs.existsSync(opts.args.output.reverse()[0])) {
                            resolve(fs.readFileSync(opts.args.output.reverse()[0]))
                        } else resolve(Buffer.from([]))
                    }
                }
            }
            
            ffmpeg.on('exit', (...exit) => {
                ffmpegClose = true;
                ffmpegCodeExit = exit[0];
                exitHandler()
            })
            
            ffmpeg.stdio[1].on('data', (data) => {
                DataFFMpegStdOut = Buffer.concat([DataFFMpegStdOut, data])
            })
        })
        return result
    } catch (error) {
        throw error
    }
}

const ToImg = async function (input) {
    try { 
        const opts = OptsFFMpeg()
        const filename = MakeTMPFile('.png')
        
        opts.args.output = [filename]
        const result = await processor(input, opts)
        return result
    } catch (error) {
        throw error
    }
}

const ToGif = async function (input) {
    try { 
        const opts = OptsFFMpeg()
        const filename = MakeTMPFile('.gif')
        
        opts.args.output = [filename]
        const result = await processor(input, opts)
        return result
    } catch (error) {
        throw error
    }
}

const ToVid = async function (input) {
    try { 
        const opts = OptsFFMpeg()
        const filename = MakeTMPFile('.mp4')
        
        opts.args.output = [filename]
        const result = await processor(input, opts)
        return result
    } catch (error) {
        throw error
    }
}

const ToAud = async function (input) {
    try { 
        const opts = OptsFFMpeg()
        const filename = MakeTMPFile('.mp3')
        
        opts.args.output = [filename]
        const result = await processor(input, opts)
        return result
    } catch (error) {
        throw error
    }
}

export {
    OptsFFMpeg,
    processor,
    ToAud,
    ToImg,
    ToVid,
    ToGif
}