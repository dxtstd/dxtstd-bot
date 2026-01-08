import InitBot from './System/init'
import { setListener } from './System/Listener'
import { setHandler } from './System/Handler'

import { logger } from './Utils'

import { Boom } from '@hapi/boom'
import { useMultiFileAuthState } from '@adiwajshing/baileys'

async function sleep(ms: number): Promise<unknown> { 
    return await new Promise((res) => setTimeout(res, ms))
}

const start = async function () {
    const config = {}
    const bot = InitBot()
    
    bot.database.store.readFromFile(bot.database.config.db.file.store)
    bot.database.store.bind(bot.sock.ev)
    async function storeLoop(this) {
        var current = 0
        var target = 60;
        do {
            await sleep(1000)
            current ++
            if (current >= target) {
                bot.database.store.writeToFile(bot.database.config.db.file.store)
                storeLoop()
            } 
        } while (!(current >= target))
    }
    
    //Set Listener for bot.sock.ev
    setListener(bot)
    //Set Listener for bot.events
    setHandler(bot)

    bot.sock.ev.on('connection.update', (update) => {
        if (update.connection == 'close') {
            const statusCode = (update.lastDisconnect?.error as Boom)?.output?.statusCode
            if (statusCode != 401) {
                start()
            }
        }
    })
    //storeLoop()
    return bot
}
//console.log('STARTING...')
start()
