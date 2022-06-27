import { existsSync, mkdirSync, writeFileSync } from "fs"
import * as path from "path"

const dirTMPLocal = path.resolve(__dirname, '..', '..', 'tmp/')
const dirTMP = path.resolve(path.join(__dirname, '..', '../'))
const defaultDirTMP = existsSync(process.env['TMPDIR'] as any) ? process.env['TMPDIR']+'/' : (existsSync(dirTMPLocal) ? dirTMPLocal : dirTMP)

const MakeRandom = function () {
    return Math.floor(Math.random() * 9)
}

const MakeTMPFile = function (ext: string='', dir: string='', media: any=undefined) {
    dir = dir ? dir : defaultDirTMP;
    if (!existsSync(dir)) new Error();
    
    let filename = path.resolve(dir, 'tmp-');
    for (let i = 0;i <= 8;i ++) {
        filename += MakeRandom()
    }
    
    if (ext) {
        if (ext.startsWith('.')) {
            filename += ext
        } else {
            filename += '.' + ext
        }
    }
    
    if (media) {
        writeFileSync(filename, media)
    }
    
    return filename
}

const MakeTMPFolder = function (dir: string='') {
    dir = dir ? dir : defaultDirTMP;
    if (!existsSync(dir)) new Error();
    
    let dirname = dir + 'tmp-';
    for (let i = 0;i <= 8;i ++) {
        dirname += MakeRandom()
    }
    
    mkdirSync(dirname)
    return dirname
}

export {
    MakeTMPFile,
    MakeTMPFolder
}