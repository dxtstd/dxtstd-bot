import makeWASocket, {
    downloadMediaMessage,
    getContentType,
    isJidGroup,
    normalizeMessageContent,
    proto
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";

import * as util from "util";

import * as Socket from "./Socket";
import * as Database from "./database";
import * as Events from "./Events"
import * as types from "../Types"

import logger_default from "../Utils/logger";
import { Commands } from "./command";
import { configuration } from "./config";
const logger = logger_default.child({ class: "dxtstd-bot", system: "init" })

export class Bot {
    public sock;
    public database: types.database.main;
    public event;
    public command: Commands;
    public logger;

    public makebot: any;
    public config: any = {
        init: {},
        bot: {

        }
    };

    public setTimeout: (reject: any, timeout?: number) => void;
    public checkIsAdmin: (gid: string, uid: string) => Promise<{
        uid: string,
        status: boolean,
        super: boolean
    }>
    public checkIsAdminBot: (uid: string) => {
        uid: string,
        status: boolean
    };
    public checkIsOwner: (uid: string) => {
        uid: string,
        status: boolean
    };
    
    public fetchText: (text: string) => {
        args: string[];
        body: string;
        command: string|undefined;
        full: string;
        prefix: string;
    };

    public sendButton: (jid: string, content: any, opts: any) => any
    constructor(config) {
        this.makebot = config.makebot || {};

        Database.check(config.database) ? void 0 : Database.create(config.database);
        
        this.config.init = {
            ...this.config.init,
            ...config
        };
    };

    private utility() {

    }

    public async load() {
        logger.info("load event...");
        this.event = new Events.build();
        logger.info("load database...");
        this.database = Database.load(this.config.init.database);
        logger.info("load configuration");
        await (configuration.bind(this))();
        logger.info("add function to bot")
        this.utility()

        logger.info("load commmands");
        this.command = new Commands();
        await this.command.load();
    }

    public async run() {
        const { saveCreds, state } = await Socket.usePouchDBAuthState(this.database);
        this.sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            logger: logger.child({ class: "baileys" }) as any,
            browser: ["Ubuntu", "Google Chrome", "22.04"]
        });
        this.sock.ev.on("creds.update", async () => {
            saveCreds();
        });
        logger.info("set listener for socket and bot...")
        Events.listener.set.socket.bind(this)();
        Events.listener.set.bot.bind(this)();

        this.sock.ev.on('connection.update', async (update) => {
            if (update.qr) { 
                console.info('Scan this QR!');
            }
            if (update.connection == 'connecting') console.info('Connecting to WhatsApp Web...');
        
            if (update.connection == 'close') {
                const statusCode = (update.lastDisconnect?.error as Boom)?.output?.statusCode;
                if (statusCode != 401) {
                    saveCreds();
                    this.run.bind(this)()
                }
            }
        })

        if (this.makebot.callback?.connection) {
            this.sock.ev.on('connection.update', this.makebot.callback.connection);
        }
    };
}



Bot.prototype.setTimeout = function (this: Bot, reject: any, timeout?: number) {
    const TIMEOUT_DURATION = timeout || 30000;
    setTimeout(
        () => { 
            reject(new Error(`Timeout ${TIMEOUT_DURATION}ms`));
        },
        TIMEOUT_DURATION
    )
}

Bot.prototype.checkIsAdmin = async function (this: Bot, gid: string, uid: string) {
    const group = await this.database.read("groups", gid)

    return {
        uid,
        status: group.participants.filter(({id, admin}) => {
            return !!(id === uid && (admin === 'admin' || admin === 'superadmin'))
        }),
        super: group.participants.filter(({id, admin}) => {
            return !!(id === uid && admin === 'super')
        })
    }
}

Bot.prototype.checkIsAdminBot = function (this: Bot, uid: string) {
    return {
        uid,
        status: (this.config.bot.administrator as string[])?.some(v => v === uid.split("@")[0]),
    }
}

Bot.prototype.checkIsOwner = function (this: Bot, uid: string) {
    return {
        uid,
        status: (uid.split("@")[0] === this.config.bot.owner.phone),
    }
}

Bot.prototype.fetchText = function (this: Bot, text: string) {
    const def_prefix = this.config.bot.prefix;
    let prefix = "";
    const isCommand = ((typeof def_prefix) == "object") ? def_prefix.map(pref => {
        const condition = text.startsWith(pref)
        if (condition) {
            prefix = pref;
            return condition
        }
    }).filter(condition => condition)[0] || false : text.startsWith(def_prefix)
    
    return {
        args: text.trim().split(/ +/).slice(1).join(' ').split("|"),
        body: text.trim().split(/ +/).slice(1).join(' '),
        command: (isCommand ? text.trim().slice(prefix.length).split(/ +/)[0] : undefined),
        full: text,
        prefix
    }
}

Bot.prototype.sendButton = Socket.function.sendButton

const mybot = new Bot({
    database: "main"
})

mybot.load().then(() => {
    mybot.run()
})
