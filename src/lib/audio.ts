import { spawn } from 'child_process'
import { MakeTMPFile } from './tmp'


const EffectSOX = {
    reverb: ['gain', '-3', 'pad', '0', '4', 'reverb', '100', '100', '100', '100', '0', '6'],
    reverse: ['reverse'],
    slow: ['speed', '0.8'],
    fast: ['speed', '1.2'],
    chipmunk: ['pitch', '8'], 
    deep: ['pitch', '-8']
}

const EffectFFMPEG = {
    robot: ['afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75'],
    echo: ['aecho=0.8:0.9:500|1000:0.2|0.1']
}


const processor = async function (input: any, opts: any) {
    try {
        const result = await new Promise(async (resolve, reject) => {
            if (!input._readableState) reject(new Error('The input must be a stream!'));
            
            let buffer = Buffer.from([])
            
            
            const ffmpeg = spawn('ffmpeg', opts.ffmpeg.args.result())
            let DataFFMpegStdErr = Buffer.from([])
            let ffmpegClose: boolean;
            let ffmpegCodeExit: number|null;
            
            const sox = spawn('sox', opts.sox.args.result())
            let DataSoxStdErr = Buffer.from([])
            let soxClose: any;
            let soxCodeExit: number|null;
            
            
            /*
                stdio[0] = stdin
                stdio[1] = stdout
                stdio[2] = stderr
            */
            
            input.resume()
            ffmpeg.stdio[1].resume()
            
            input.pipe(ffmpeg.stdio[0])
            ffmpeg.stdio[1].pipe(sox.stdio[0])
            
            sox.stdio[1].on('data', (data) => {
                buffer = Buffer.concat([buffer, data])
            })
            
            ffmpeg.stdio[2].on('data', (data) => {
                DataFFMpegStdErr = Buffer.concat([DataFFMpegStdErr, data])
            })
            
            sox.stdio[2].on('data', (data) => {
                DataSoxStdErr = Buffer.concat([DataSoxStdErr, data])
            })
            
            const exitHandler = function () {
                if (ffmpegCodeExit != 0 && soxCodeExit != 0) {
                    const error = `\n\tFFMPEG: ${String(DataFFMpegStdErr)}\n\tSOX: ${String(DataSoxStdErr)}`
                    reject(new Error(error))
                } else if (ffmpegCodeExit == 0 && soxCodeExit != 0) {
                    const error = `\n\tFFMPEG: ${String(DataFFMpegStdErr)}\n\tSOX: ${String(DataSoxStdErr)}`
                    reject(new Error(error))
                }
                
                if (ffmpegClose && soxClose) {
                    resolve(buffer)
                }
            }
            
            ffmpeg.on('exit', (...exit) => {
                ffmpegClose = true;
                ffmpegCodeExit = exit[0];
                exitHandler()
            })
            
            sox.on('exit', (...exit) => {
                soxClose = true;
                soxCodeExit = exit[0];
                exitHandler()
            })
        })
        return result
    } catch (error) {
        throw error
    }
}

const effect = async function (input: any, args: Array<string>=[]) {
    const opts = {
        ffmpeg: {
            args: {
                input: ['-hide_banner', '-i', 'pipe:0'],
                effect: [],
                output: ['-f', 'flac', 'pipe:1'],
                result: function (this: any) {
                    if (this.effect != 0) {
                        let res = this.effect.join(',')
                        return this.input.concat('-filter_complex' , res, this.output)
                    } else return this.input.concat(this.output)
                }
            },
            opts: {
                stdio: 'pipe'
            }
        },
        sox: {
            args: {
                input: ['-'],
                output: ['-t', 'mp3', '-'],
                effect: [],
                result: function (this: any) {
                    return (this.input.concat(this.output, this.effect))
                }
            }
        }
    }
    
    try {
        const result = new Promise(async (resolve, reject) => {
            args.forEach((v) => {
                if (!EffectFFMPEG[v] && EffectSOX[v]) {
                    opts.sox.args.effect = opts.sox.args.effect.concat(EffectSOX[v])
                } else if (EffectFFMPEG[v] && !EffectSOX[v]) {
                    opts.ffmpeg.args.effect = opts.ffmpeg.args.effect.concat(EffectFFMPEG[v])
                } else {
                    reject(new Error(`Effect "${v}" not found!`))
                }
            })
            try { 
                const result = await processor(input, opts)
                return resolve(result)
            } catch (error) {
                reject(error)
            }
        })
        return result
    } catch (error) {
        throw error
    }
}

export {
    effect,
    processor
}