import makeSocket, { 
    DEFAULT_CONNECTION_CONFIG,
    WASocket as InterfaceWASocket
} from '@adiwajshing/baileys'
import { logger } from '../../Utils'

export interface IWASocket extends InterfaceWASocket {
    
}

export function makeWASocket(opts): IWASocket {
    const Socket = makeSocket({
        printQRInTerminal: (opts.qrterm ? true : false),
        version: DEFAULT_CONNECTION_CONFIG.version,
        logger: opts.logger || logger,
        ...opts
    })
    
    return Socket
}

export * as function from "./function"