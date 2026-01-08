import {
    mkdirSync,
    readFileSync,
    writeFileSync,
    statSync,
    unlinkSync,
    existsSync
} from "fs";

import { join } from "path";
import { 
    initAuthCreds,
    AuthenticationCreds,
    AuthenticationState,
    BufferJSON,
    SignalDataTypeMap,
    makeCacheableSignalKeyStore,
    proto
} from "@adiwajshing/baileys";

import { logger } from "../../Utils"

export const useMultiFileAuthState = (folder: string): {
    state: AuthenticationState, 
    saveCreds: () => void 
} => {
    const writeData = (data: any, file: string) => {
        return writeFileSync(join(folder, fixFileName(file)!), JSON.stringify(data, BufferJSON.replacer, '\t'))
    }

    const readData = (file: string) => {
        try {
            const data = readFileSync(join(folder, fixFileName(file)!), { encoding: 'utf-8' })
            return JSON.parse(data, BufferJSON.reviver)
        } catch (error) { return null }
    }

    const removeData = (file: string) => {
        try {
            unlinkSync(join(folder, fixFileName(file)!))
        } catch { }
    }

    const folderInfo = existsSync(folder) ? statSync(folder) : false
    if (folderInfo) {

        if (!folderInfo.isDirectory()) {
            throw new Error(`found something that is not a directory at ${folder}, either delete it or specify a different location`)
        }
    } else {
        mkdirSync(folder, { recursive: true })
    }

    const fixFileName = (file?: string) => file?.replace(/\//g, '__')?.replace(/;/g, '-')

    const creds: AuthenticationCreds = readData('creds.json') || initAuthCreds();

    return {
        state: {
            creds,
            keys: makeCacheableSignalKeyStore({
                get: async(type, ids) => {
                    const data: { [_: string]: SignalDataTypeMap[typeof type]} = {}
                    await Promise.all(ids.map(
                        async id => {
                            let value = readData(`${type}-${id}.json`)
                            if (type === 'app-state-sync-key' && value) {
                                value = proto.Message.AppStateSyncKeyData.fromObject(value)
                            }

                            data[id] = value
                        }
                    ))
                    return data
                },
                set: async(data) => {
                    const tasks: void[] = []
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id]
                            const file = `${category}-${id}.json`
                            tasks.push(value ? writeData(value, file) : removeData(file))
                        }
                    }

                    await Promise.all(tasks)
                }
            }, logger)
        },
        saveCreds: () => {
            return writeData(creds, `creds.json`)
        }
    }
}
