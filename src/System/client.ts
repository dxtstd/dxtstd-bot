import makeWASocket, { DEFAULT_CONNECTION_CONFIG } from '@adiwajshing/baileys';

import { logger } from '../Utils';
import { Database } from './database';
import { EventsHandler } from './Handler';

const startClient = function (opts: any={}) {
    const database = new Database((opts.db));
    database.load((opts.db));
    
    const client = makeWASocket({
        auth: database.auth,
        printQRInTerminal: (opts.printQR ? true : false),
        version: DEFAULT_CONNECTION_CONFIG.version,
        logger: logger
    });
    
    if (opts.bind) EventsHandler(client, database, opts);
    return client;
};

export { 
    startClient
};
