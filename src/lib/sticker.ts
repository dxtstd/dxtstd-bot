import { spawn } from "child_process"
import * as fs from "fs"
import * as path from "path"
import * as webp from "node-webpmux"
import { MakeTMPFile, MakeTMPFolder } from './tmp'
import { logger } from './logger'

export async function toWEBP(input: any) {
    try { 
        let hasil = await new Promise(async function (resolve, reject) {
            let input2
            let type
            if (input._readableState) type = "stream";
                else if (typeof input == "string") type = "path";
            else return reject();
            
            const filename = MakeTMPFile('webp')
            let args;
            let opts;
            switch (type) {
                case "stream": 
                    input2 = input
                    input2.resume()
                    args = ['-i', 'pipe:0','-vf', 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1', filename]
                    break
                case "path":
                    args = ['-i', input, '-vf', 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1', filename ]
                    break;
            }
            
            const ffmpeg = await spawn('ffmpeg', ['-hide_banner'].concat(args), opts)
            let DataFFMpegStdErr = Buffer.from([])
            
            if (type == "stream") {
                input2.pipe(ffmpeg.stdio[0])
            }
            
            ffmpeg.on('exit', async (...args) => {
                if (args[0] != 0) {
                    reject(new Error('\n\tFFMPEG: ' + String(DataFFMpegStdErr)))
                }
                
                try {
                    const result = await fs.readFileSync(filename)
                    fs.unlinkSync(filename)
               
                    resolve(result)
                } catch (error) {
                    reject(error)
                }
            })
            
            ffmpeg.stderr.on('data', (data) => {
                DataFFMpegStdErr = Buffer.concat([DataFFMpegStdErr, data])
            })
        
        })
        return hasil
    } catch (error) {
        throw error
    }
}

export async function addExif(webpBuffer, exifJSON: any) {
    try {
        const img = new webp.Image();
        let exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
        let jsonBuffer = Buffer.from(JSON.stringify(exifJSON), 'utf8');
        let exif = Buffer.concat([exifAttr, jsonBuffer]);
        exif.writeUIntLE(jsonBuffer.length, 14, 4);
        await img.load(webpBuffer);
        img.exif = exif;
        return await img.save(null);
    } catch (error) {
        throw error
    }
}