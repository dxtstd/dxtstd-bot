import { BufferJSON } from "@whiskeysockets/baileys"
import * as types from "../../Types"
import logger_default from "../../Utils/logger"
const logger = logger_default.child({ class: "dxtstd-bot", system: "auth" })

import { 
    AuthenticationCreds, 
    AuthenticationState, 
    SignalDataTypeMap,
    initAuthCreds,
    proto
} from "@whiskeysockets/baileys"
const errorHandler = (...error) => logger.error(error)

export async function usePouchDBAuthState(database: types.database.main): Promise<{ state: AuthenticationState, saveCreds: () => Promise<any> }> {
    const fixid = (id?: string) => { 
        const resId = id?.replace(/\//g, '__')?.replace(/:/g, '-') 
        return resId
    }

    const writeData = async function (id: string, data: any): Promise<any> {
        let tmpdata: any = {}
        return new Promise(function (resolve, reject) {
            database.auth.find({
                selector: {_id: fixid(id)}
            }).then(({ docs }) => {
                if (docs.filter(doc => doc._id == fixid(id))[0]) {
                    database.auth.get(fixid(id))
                    .then(() => {
                        database.auth.upsert(fixid(id), (doc: any) => {
                            doc.data = JSON.stringify(data||{}, BufferJSON.replacer, '\t')
                            if (!doc.count) {
                                doc.count = 0
                            } 
                            doc.count = doc.count + 1
                            return doc
                        }).then(() => {
                            logger.debug({ id: fixid(id) }, "writing (upsert) data to auth")
                            resolve({})
                        })
                        .catch((e) => (errorHandler("write upsert", e), resolve({})))
                    })
                    .catch((e) => (errorHandler("write get upsert", e), resolve({})))
                } else {
                    tmpdata._id = fixid(id)
                    tmpdata.data = JSON.stringify(data||{}, BufferJSON.replacer, '\t')
                    tmpdata.count = 0
                    database.auth.putIfNotExists(tmpdata)
                    .then(() => {
                        logger.debug({ id: fixid(id) }, "writing (put) data to auth")
                        resolve({})
                    })
                    .catch((e) => (errorHandler("write put", e), resolve({})))
                }
            })
        })
    }

    const readData = async function (id): Promise<any> {
        return new Promise(function (resolve, reject) {
            database.auth.find({
                selector: {_id: fixid(id)}
            }).then(({ docs }) => {
                if (!docs.filter(doc => doc._id == fixid(id))[0]) (logger.debug("skip"), resolve(void 0))
                if (!!docs.length) {
                    database.auth.get(fixid(id))
                    .then((doc: any) => {
                        logger.debug({ id: fixid(id) }, "read data from auth")
                        resolve(JSON.parse(doc.data, BufferJSON.reviver))
                    })
                    .catch((e) => (errorHandler("read", e, { id: fixid(id) }), resolve({})))
                } else {
                    resolve(void 0)
                }
            })
        })
    }

    const removeData = async function (id): Promise<any> {
        return new Promise(function (resolve, reject) {
            database.auth.find({
                selector: {_id: fixid(id)}
            })
            .then(({ docs }) => {
                if (!docs.filter(doc => doc._id == fixid(id))[0]) resolve({})
                if (docs.length) {
                    database.auth.get(fixid(id))
                    .then((doc) => {
                        database.auth.remove(doc._id, doc._rev)
                        .then(() => {
                            logger.debug({ id: fixid(id) }, "remove data from auth")
                            resolve(void 0)
                        })
                        .catch((e) => (errorHandler("remove", e, { id: fixid(id) }), resolve({})))
                    })
                    .catch((e) => (errorHandler("remove get", e, { id: fixid(id) }), resolve({})))
                } else {
                    resolve({})
                }
            })
        })
    }

    const creds: (AuthenticationCreds) = (await readData("creds")) || initAuthCreds()
    
    return {
        state: {
            creds,
            keys: {
                get: async(type, ids) => {
                    return new Promise((resolve) => {
                        const data: { [_: string]: SignalDataTypeMap[typeof type] } = { }
                        database.queue.add("auth", async function getData() {
                            await Promise.all(
                                ids.map(async (id) => {
                                    let value = await readData(`${type}-${id}`)
                                    if(type === 'app-state-sync-key' && value) {
                                        value = proto.Message.AppStateSyncKeyData.fromObject(value)
                                    }
             
                                    data[id] = value
                                })
                            )
                            resolve(data)
                        })
                    })
                },
                set: async(data) => {
                    const tasks: Promise<void>[] = []
                    for (const category in data) {
                        for(const id in data[category]) {
                            const value = data[category][id]
                            const id_data = `${category}-${id}`
                            value ? database.queue.add("auth", writeData, id_data, value) : database.queue.add("auth", removeData, id_data)
                        }
                    }
                }
            }
        },
        saveCreds: async() => {
            await database.queue.add("auth", writeData, "creds", creds)
            return 
        }
    }
}