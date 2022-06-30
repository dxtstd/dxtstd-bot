import * as fs from 'fs'
import * as path from 'path'

import {
    AuthenticationCreds, 
    AuthenticationState,
    BufferJSON,
    SignalDataTypeMap,
    initAuthCreds,
    proto
} from '@adiwajshing/baileys'

/**
 * stores the full authentication state in a single folder.
 * Far more efficient than singlefileauthstate
 *
 * Again, I wouldn't endorse this for any production level use other than perhaps a bot.
 * Would recommend writing an auth state for use with a proper SQL or No-SQL DB
 * */
const Stringify = function (value: object={}, replacer: any=null, space='\t') {
    return JSON.stringify((value || {}), (replacer), (space))
}

const FixFilename = (file?: string) => file?.replace(/\//g, '__')?.replace(/:/g, '-')

export async function AuthBaileys(folder): Promise<{ state: AuthenticationState }> {
    
    let folderInfo;
    try {
        folderInfo = await fs.statSync(folder)
    } catch (error) {}
    
    if (folderInfo) {
        if(!folderInfo.isDirectory()) {
            throw new Error(`found something that is not a directory at ${folder}, either delete it or specify a different location`)
        }
    } else {
        await fs.mkdirSync(folder, { recursive: true })
    }
    
    const WriteData = async (data: any, file: string) => {
        try {
            return fs.writeFileSync(
                path.join(folder, FixFilename(file)),
                Stringify(data, BufferJSON.replacer)
            )
        } catch (error) {
            return null
        }
    }
    
    const ReadData = async (file: string) => {
        try {
            const data = await fs.readFileSync(
                path.join(folder, FixFilename(file)),
                { encoding: 'utf-8' }
            )
            return JSON.parse(data, BufferJSON.reviver)
        } catch (error) {
            return null
        }
    }
    
    const RemoveData = async (file: string) => {
        try {
            return await fs.unlinkSync(path.join(folder, file))
        } catch (error) {
            return null
        }
    }
    
    const creds: AuthenticationCreds = await ReadData('creds.json') || initAuthCreds()
    
    const GetKey = async (type, ids) => {
        const data: any = { }
        await Promise.all(
            ids.map(
                async id => {
                    let value = await ReadData(`${type}-${id}.json`)
                    if (type === 'app-state-sync-key' && value) {
                        value = proto.AppStateSyncKeyData.fromObject(value)
                    }
                    data[id] = value
                }
            )
        )
        return data
    }
    
    const SetKey = async (data) => {
        const tasks: Promise<void>[] = []
        for (const category in data) {
            for(const id in data[category]) {
                const value = data[category][id]
                const file = `${category}-${id}.json`
                tasks.push(value ? WriteData(value, file) : RemoveData(file))
            }
        }
        
        await Promise.all(tasks)
    }
    
    return {
        state: {
            creds,
            keys: {
                get: GetKey,
                set: SetKey
            }
        },
        save: {
            creds: ({ creds }) => {
                WriteData(creds, 'creds.json')
            }
        }
    }
}