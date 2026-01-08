import yargs from 'yargs'

import * as fs from 'fs'
import * as path from 'path'

import * as defaults from '../Defaults'
import * as types from '../Types'

const JSONConfigFile = path.resolve(__dirname, '../..', 'config.json')
const JSONConfig = fs.existsSync(JSONConfigFile) ? JSON.parse(fs.readFileSync(JSONConfigFile, { encoding: 'utf-8' })) : ({} as types.database.config)

export function bot (database) {
    database.load()
    
    const config: Partial<types.database.config> = {
        ...defaults.config,
        ...database.config,
        ...JSONConfig
    } as types.database.config
    
    const argsconf = yargs(process.argv.slice(2)).parseSync()
    
    config['read-only'] = false
    if (argsconf['read-only']) {
        config['read-only'] = true
    }
    
    if (argsconf['qrterm']) {
        
    }
    
    if (argsconf['prefix']) {
        config.prefix = argsconf['prefix'] || config.prefix
    }
    
    database.config = config;
    
    if (!database.response?.button) {
        database.response.button = {}
    }
    if (!database.response?.list) {
        database.response.list = {}
    }
    
    database.save()
}

export async function baileys () {
    (await import("@adiwajshing/baileys/lib/Utils/generics"))
    /* .generateMessageID = function (): string {
        var ID = "DXTSTD"
               + Date.now().toString(36)
               + Math.random().toString(36).substr(2)
               
        return ID.toUpperCase()
    }
    */
}
