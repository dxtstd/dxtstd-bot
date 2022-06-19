import makeWASocket, { DEFAULT_CONNECTION_CONFIG } from '@adiwajshing/baileys';
import * as fs from 'fs';
import * as path from 'path';

import { logger } from '../lib/logger';
import { Database } from './database'
import { EventsHandler } from './handler'

const startClient = function (opts: any={}) {
    const database = new Database((opts.db))
    database.load((opts.db))
    
    const client = makeWASocket({
        auth: database.auth,
        printQRInTerminal: (opts.printQR ? true : false),
        version: DEFAULT_CONNECTION_CONFIG.version,
        logger: logger
    })
    
    if (opts.bind) EventsHandler(client, database, opts)
    return client
}

export { 
    startClient
}
