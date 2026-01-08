import { Commands } from './command'
import { Database } from './database'
import * as configuration from './configuration'

import * as Socket from './Socket'
import { Events } from './Events'

import { logger as PLogger } from '../Utils'
import { Boom } from '@hapi/boom'

import { makeInMemoryStore, initAuthCreds } from '@adiwajshing/baileys'
import { useMultiFileAuthState } from "./Socket/auth"

import { Agent } from "https"

type ValueButton = {
    text: string,
    command: string,
    type: number
}

class Bot {
    public commands: Commands
    public database: Database
    public events: Events
    public sock: Socket.IWASocket;
    public chats: any
    
    private configuration: {
        db: string;
        logger: any
    } = {
        db: 'main',
        logger: PLogger
    }
    
    
    public sendButton: (
        jid: string, 
        content: Partial<{
            image: any;
            text: string;
            caption: string;
            footer: string;
            buttons: ValueButton[]
        }>,
        opts?: any
    ) => Promise<void>
    
    public fetchText: (text: string) => {
        args: string[];
        body: string;
        command: string|undefined;
        full: string;
    }
    
    public setTimeout: (reject: any) => void;
    
    public logger: any
    public isAdmin: (jid: string) => boolean
    constructor(
        config?: any
    ) {
        if (config) this.configuration = {
            ...this.configuration,
            ...config
        }
        
        const { logger } = this.configuration
        
        logger.info('Load Commands...')
        this.commands = new Commands()
        
        logger.info('Load Database...')
        this.database = new Database(this.configuration.db)
        this.database.load()
        
        logger.info('Setup config bot...')
        configuration.bot(this.database)
        this.database.load()
        
        logger.info('Setup Baileys...')
        configuration.baileys()
        
        logger.info('Load Events...')
        this.events = new Events()
        
        //logger.info('Load Handler...')
        //this.handler = {}
        const { state, saveCreds } = useMultiFileAuthState("AUTH_DXTSTD");
        logger.info('Make WA Socket...')
        this.sock = Socket.makeWASocket({
            
            auth: state,
            qrterm: true,
            logger
        })
        this.sock.ev.on("creds.update", saveCreds)
        this.sock.ev.on('connection.update', (update) => {
            if (update.qr) logger.info('Scan this QR!')
            if (update.connection == 'connecting') logger.info('Connecting to WhatsApp Web...')
        
            if (update.connection == 'close') {
                const statusCode = (update.lastDisconnect?.error as Boom)?.output?.statusCode
                if (statusCode != 401) {
                    saveCreds()
                }
            }
        })
        this[Symbol("bot.configuration")] = this.configuration
        this[Symbol("bot.startup")] = new Date
        
        delete this.configuration
    }
    
}

Object.keys(Socket.function).forEach(fungsi => {
    Bot.prototype[fungsi] = Socket.function[fungsi]
})

Bot.prototype.fetchText = function (text: string) {
    const def_prefix = this.database.config.prefix;
    let prefix = "";
    const isCommand = ((typeof def_prefix) == "object") ? def_prefix.map(pref => {
        const condition = text.startsWith(pref)
        if (condition) {
            prefix = pref;
            return condition
        }
    }).filter(condition => condition)[0] || false : text.startsWith(def_prefix)
    
    return {
        args: text.trim().split(/ +/).slice(1),
        body: text.trim().split(/ +/).slice(1).join(' '),
        command: (isCommand ? text.trim().slice(prefix.length).split(/ +/)[0] : undefined),
        full: text
    }
}
Bot.prototype.isAdmin = function (jid: string) {
    const admin = {
        super: (this.database.groups[jid]?.participants ? (this.database.groups[jid]?.participants.filter(({ id }) => {
            return (id == ((this.sock.user.id).split(':')[0] + '@s.whatsapp.net'))
        })[0]?.admin == 'superadmin') : false),
        normal: (this.database.groups[jid]?.participants ? (this.database.groups[jid]?.participants.filter(({ id }) => {
            return (id == ((this.sock.user.id).split(':')[0] + '@s.whatsapp.net'))
        })[0]?.admin == 'admin') : false)
    };
    
    return (admin.super || admin.normal || false)
}

Bot.prototype.setTimeout = function (reject: any, timeout?: number) {
    const TIMEOUT_DURATION = timeout || 60000 
    setTimeout(
        () => { 
            reject(new Error(`Timeout ${TIMEOUT_DURATION}ms`)) 
        },
        TIMEOUT_DURATION
    )
}

Bot.prototype.logger = PLogger;

export default function InitializerBot(config?: any): Bot {
    return new Bot(config)
}