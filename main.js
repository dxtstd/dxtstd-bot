//
//   /$$$$$$$                        /$$                /$$$$$$  /$$   /$$
//  | $$__  $$                      | $$               /$$__  $$| $$  | $$
//  | $$  \ $$  /$$$$$$  /$$$$$$$  /$$$$$$    /$$$$$$ | $$  \__/| $$  | $$
//  | $$  | $$ /$$__  $$| $$__  $$|_  $$_/   |____  $$| $$      | $$$$$$$$
//  | $$  | $$| $$$$$$$$| $$  \ $$  | $$      /$$$$$$$| $$      | $$__  $$
//  | $$  | $$| $$_____/| $$  | $$  | $$ /$$ /$$__  $$| $$    $$| $$  | $$
//  | $$$$$$$/|  $$$$$$$| $$  | $$  |  $$$$/|  $$$$$$$|  $$$$$$/| $$  | $$
//  |_______/  \_______/|__/  |__/   \___/   \_______/ \______/ |__/  |__/
//
//
//THX TO
//Rxyu
//Fauzan
//Restu
//Vania
//Sanz
//Arifin
//and ETC

//MAIN MODULE
const baileys = global.baileys = require("@adiwajshing/baileys");

//
const fs = require("fs");
const util = require('util');
const moment = require("moment-timezone");
const path = require("path");
const os = require("os");
const chalk = require('chalk');

//LOCAL MODULE
const P = require('./lib/P');

//DIR
const dir = global.dir = {
    home: path.join(__dirname, '/'),
    assets: path.join(__dirname, '/', 'assets', '/'),
    database: path.join(__dirname, '/', 'database', '/'),
    handler: path.join(__dirname, '/', 'handler', '/'),
    lib: path.join(__dirname, '/', 'lib', '/'),
    log: path.join(__dirname, '/', 'log', '/'),
    plugins: path.join(__dirname, '/', 'plugins', '/'),
    tmp: path.join(__dirname, '/', 'tmp', '/'),
    sdcard: '/sdcard/'
};

//PATH
const authPath = dir.home + 'auth.json';

//CONFIG
const config = global.config = JSON.parse(
    fs.readFileSync(
        path.join(
            __dirname,
            'config.json'
        )
    )
);

const logger = global.logger = require('./lib/logger');


//DATABASE
global.db = {
    users: {},
    groups: {},
    session: {
        game: {},
        auth: {}
    }
};
global.db.users = JSON.parse(fs.readFileSync(path.join(dir.database, 'users.json')));
global.db.groups = JSON.parse(fs.readFileSync(path.join(dir.database, 'groups.json')));


//AUTH
const loadAuth = function () {
    let auth = {}
    try {
        if (!fs.existsSync(authPath))
            return logger.existnt();

        logger.info('Load auth...');
        auth = baileys.useSingleFileAuthState(authPath)
    } catch (e) {
        logger.error("Load auth error!");
        console.error(e)
    }
    return auth.state
};

const saveAuth = function (auth) {
    P.info("Save auth");
    fs.writeFileSync(
        authPath,
        JSON.stringify(auth, baileys.BufferJSON.replacer, 2)
    );
    return auth;
};


//PLUGIN LOADER
global.loadPlugin = function () {
    let pluginFilter = filename => /\.js$/.test(filename);
    global.plugins = {};
    for (let filename of fs.readdirSync(dir.plugins).filter(pluginFilter)) {
        filename = filename.replace('.js', '');
        try {
            let pluginLoading = require(path.join(dir.plugins, filename));
            if (pluginLoading.support && pluginLoading.support[os.platform()]) {
                global.plugins[filename] = pluginLoading
            } else {
                logger.error(`Plugin ${filename.split('.')[0]} Does'nt support in your OS`)
            }
            
            if (pluginLoading.beta) {
                logger.warn(`Plugin ${filename.split('.')[0]} still in beta, there may be errors when running`)
            }
            
            if (pluginLoading.disable) {
                logger.warn(`Plugin ${filename.split('.')[0]} is disable! for reason check the script`)
            }
        } catch (e) {
            logger.error(e, `[PLUGIN ${filename}] `);
            delete global.plugins[filename];
        }
    }
};

//START API
startClient = function () {
    const starting = baileys.default({
        logger: logger,
        printQRInTerminal: true,
        auth: loadAuth(),
        version: [2, 2281, 0]
    });
    return starting;
};

//START BOT
const start = async () => {
    try {
        const client = global.client = startClient();
        loadPlugin();

        //AUTH UPDATE
        client.ev.on('creds.update', () => {
            saveAuth(client.authState);
        });

        //CONTACT
        client.ev.on('contacts.update', (contact) => {
            id = contact[0].id;
            if (global.db.users[id] === undefined) {
                user = JSON.parse(fs.readFileSync(path.join(dir.assets, 'newUser.json')));
                user.profile.name.notify = contact[0].notify;
                user.id = id;
                global.db.users[id] = user;
            }
            fs.writeFileSync(path.join(dir.database, 'users.json'), JSON.stringify(global.db.users, null, '\t'));
        });

        //EVENT HANDLER
        client.handler = require('./handler');
        //client.ev.on('messages.upsert', client.handler.newHandler);
        client.ev.on('messages.upsert', client.handler.handler);
        client.ev.on('group-participants.update', client.handler.greeting_member)

        //CONNECTION UPDATE
        client.ev.on('connection.update',
            (update) => {
                if (update.qr) {
                    return logger.info("Scan this QR");
                }
                if (update.connection === 'close') {
                    fs.writeFileSync("./log/connection/closed.json", JSON.stringify(update, null, "\t"));
                    console.log(update);
                    statusCode = update.lastDisconnect.error.output ? update.lastDisconnect.error.output.statusCode: undefined;
                    logger.error(`Disconnect... ${statusCode} ${baileys.DisconnectReason[`${statusCode}`]}`);
                    // reconnect if not logged out
                    if (statusCode !== baileys.DisconnectReason.loggedOut) {
                        delete global.client;
                        delete client;
                        logger.info("Trying reconnecting...");
                        start();
                    }
                }
                if (update.connection === "open") {
                    logger.info('Success Connected..');
                    fs.writeFileSync("./log/connection/open.json", JSON.stringify(update, null, "\t"));
                }
                return client
            });
    } catch (e) {
        P.error(e);
        logger.error(e);
    }
};
start();


module.exports = start
