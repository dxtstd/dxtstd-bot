import * as path from 'path'
import * as fs from 'fs'

import { startClient } from './client'
import { logger } from '../lib'
import { Database } from './database'
import { CONFIG } from './default'

const MakeError = function (text) {
    return new TypeError(text)
}

const StartBot = function (opts: any={}) {
    try {
        const client = startClient(opts)
        return client as any
    } catch (error) {
        return {} as any
    }
}

const StartBotArgs = function () {
    const config = CONFIG as any
    const args = [...process.argv.slice(2)]
    
    const isOpts = function (args) {
        return args.startsWith('--')
    }
    
    let i = 0
    args.forEach(v => {
        const opts = v.replace(/--/g, '') 
        switch (opts) {
            case 'read-only':
                logger.info('Enable Read Only (child ts-node)')
                config.ReadOnly = true;
                break;
            case 'qr-image':
                logger.info('Enable Save QR Image (child ts-node)')
                config.QRImage = true
                break
            case 'prefix':
                const errorP = 'missing args for "--prefix". require 1 args'
                if (!args[i + 1]) throw MakeError(errorP)
                else if (isOpts(args[i + 1])) throw MakeError(errorP);
                logger.info('Set Prefix to "%s" (child ts-node)', args[i + 1])
                config.prefix = args[i + 1]
                break;
            case 'timezone':
                const errorTZ = 'missing args for "--timezone". require 1 args'
                if (!args[i + 1]) throw MakeError(errorTZ)
                else if (isOpts(args[i + 1])) throw MakeError(errorTZ);
                logger.info('Set Timezone to "%s" (child ts-node)', args[i + 1])
                config.timezone = args[i + 1]
                break;
            case 'database':
                const errorDB = 'missing args for "--database". require 1 args'
                if (!args[i + 1]) throw MakeError(errorDB)
                else if (isOpts(args[i + 1])) throw MakeError(errorDB);
                logger.info('Set Database to "%s" (child ts-node)', args[i + 1])
                config.db.name = args[i + 1]
                break
            default:
                logger.error('Args "%s" unknown!!', opts)
                process.exit()
                break
        } 
        i ++
    })
    return config
}

if (!module.parent) {
    const config = StartBotArgs()
    const database = new Database(config.db.name)
    database.load()
    
    if (config.db.name == 'main') {
        const PATH_CONFIG_JSON = path.resolve(__dirname, '../../config.json')
        const MainConfig = JSON.parse(String(fs.existsSync(PATH_CONFIG_JSON) ? fs.readFileSync(PATH_CONFIG_JSON) : "{}")) as any;
        
        database.config = {
            ...database.config,
            ...config,
            ...MainConfig
        }
        database.save()
    }
    
    StartBot({
        db: database.config.db.name,
        printQR: true,
        bind: true
    })
}

export {
    StartBot
}