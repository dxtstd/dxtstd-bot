import { spawn } from 'child_process'
import * as fs from 'fs'

import { MakeTMPFile } from './tmp'
import * as stream from './stream'

const processor = {
    main: (input: any, opts: any={}) => {},
    convert: (input: any, opts: any={}) => {},
    compare: (input: any, opts: any={}) => {}
}

const opts = {
    main: () => {},
    convert: () => {},
    compare: () => {}
}

const ProcessorConvert = async function (input: any, opts: any={}) {
    try {
        let TypeInput = "stream"
        let TypeOutput = "buffer"
        const result = await new Promise(async (resolve, reject) => {
            try {
                if (input._readableState) {
                    opts.input.push('-')
                } else if (Buffer.isBuffer(input)) {
                    opts.input.push('-')
                    input = stream.create(input)
                } else if (fs.existsSync(input)) {
                    opts.input.push('-')
                    input = fs.createWriteStream(input)
                } else {
                    reject(new Error('Not found input'))
                }
            
                if (opts.output.length == 0) {
                    opts.output.push('-')
                    TypeOutput = 'buffer'
                } else if (typeof opts.output[0] == 'string' && opts.output[0] != '-') {
                    TypeOutput = 'path'
                }
                
                
                const magick = spawn('convert', opts.result())
                let MagickStdErr = Buffer.from([]);
                let MagickStdOut = Buffer.from([]);
                let MagickIsExit;
                let MagickCodeExit;
            
                input.resume()
                input.pipe(magick.stdio[0])
                magick.stdio[2].on('data', (data) => {
                    MagickStdErr = Buffer.concat([MagickStdErr, data])
                })
                
                if (TypeOutput == 'buffer') {
                    magick.stdio[1].on('data', (data) => {
                        MagickStdOut = Buffer.concat([MagickStdOut, data])
                    })
                } 
                
                const ExitHandler = function () {
                    if (MagickCodeExit != 0) {
                        reject(new Error('\n\tMagick: \n\t' + String(MagickStdErr)))
                    }    
                
                    if (MagickIsExit) {
                        if (TypeOutput == 'buffer') {
                            resolve(MagickStdOut)
                        } else if (TypeOutput == 'path') {
                            if (fs.existsSync(opts.output[0])) {
                                resolve(fs.readFileSync(opts.output[0])) 
                            } else {
                                reject(new Error('\n\tMagick: \n\t' + String(MagickStdErr)))
                            }
                        }
                    }
                }
            
                magick.on('exit', (...code) => {
                    MagickIsExit = true
                    MagickCodeExit = code[0]
                    ExitHandler()
                })
            } catch (error) {
                reject(error)
            }
        })
        
        return result
    } catch (error) {
        throw error
    }
}
processor.convert = ProcessorConvert

const OptsConvert = function () {
    return {
        input: [],
        filter: [],
        output: [],
        result: function (this: any) {
            return (this.input.concat(this.filter, this.output))
        }
    } as any
}

opts.convert = OptsConvert

const convert = async function MagickConvert(input: any, ext: string) {
    try {
        const opts = OptsConvert()
        opts.output.push(MakeTMPFile(ext))
        const result = await processor.convert(input, opts)
        return result
    } catch (error) {
        throw error
    }
}

export {
    convert,
    processor,
    opts
}
