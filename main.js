//MAIN MODULE
const WhatsApp = require('@adiwajshing/baileys')

//MODULE
const fs = require('fs')
const path = require('path')
const moment = require('moment-timezone')
const os = require('os')
const util = require('util')

//FOR INFO
let cp = require('child_process')
let {
    promisify
} = require('util')
let exec = promisify(cp.exec).bind(cp)

//LOCAL MODULE
global.logger = require('./lib/logger')
global.readmore = require('./lib/readmore')
global.database = require('./lib/database')

const fetcher = require('./lib/fetcher')
const funct = require('./lib/function')
global.getRandom = funct.getRandom
global.getBuffer = fetcher.getBuffer
global.fetchJson = fetcher.fetchJson

//TMP
if (fs.existsSync("./tmp")) {
    fs.rmdirSync("./tmp", {
        recursive: true,
    })
}
fs.mkdirSync("./tmp")
global.tmp = function (namefile, ext) {
    return path.join(__dirname, '/tmp/', namefile, ext || '')
}

//CONFIG
const config = JSON.parse(fs.readFileSync('./config.json'))
global.package = JSON.parse(fs.readFileSync('./package.json'))
global.prefix = config.prefix
global.owner = config.owner
global.botname = config.botname

//DATABASE
global.db = {
    bot: {},
    user: {},
    chat: {},
    chats: [],
    data: {},
    session: {}
}

//WACONNECTION
const {
    WAConnection,
    MessageType,
    Presence,
    Mimetype,
    GroupSettingChange
} = WhatsApp
global.client = new WAConnection()
global.MessageType = MessageType
global.Presence = 

global.starts = async function () {
    client.logger.level = 'warn'
    client.on('qr', () => {
        logger.qr()
    })

    fs.existsSync('./auth.json') && client.loadAuthInfo('./auth.json')

    client.on('connecting', () => {
        logger.connecting()
    })

    client.on('open', () => {
        logger.connected()

        datax = global.db.bot
        datax.name = client.user.name
        datax.jid = client.user.jid
        datax.imgUrl = client.user.imgUrl
        datax.client = {
            device: {
                info: client.user.phone,
                battery: {
                    percentage: NaN,
                    status: "NOT_CHARGING",
                    powersafe: undefined
                }
            }
        }
    })

    await client.connect({
        timeoutMs: 30 * 1000
    })
    client.sendMessage(`${owner}@s.whatsapp.net`, 'Bot Online', MessageType.text)
    fs.writeFileSync('./auth.json', JSON.stringify(client.base64EncodedAuthInfo(), null, '\t'))
}

//PLUGIN LOADER
global.loadPlugin = function () {
    let pluginFolder = path.join(__dirname, 'plugins')
    let pluginFilter = filename => /\.js$/.test(filename)
    global.plugins = {}
    for (let filename of fs.readdirSync(pluginFolder).filter(pluginFilter)) {
        filename = filename.replace('.js', '')
        try {
            global.plugins[filename] = require(path.join(pluginFolder, filename))
        } catch (e) {
            logger.error(e)
            delete global.plugins[filename]
        }
    }
}

//HANDLER
global.startHandler = function () {
    const handler = require('./handler')

    client.on('chat-update', handler.delmsg)
    client.on('chat-update', handler.handler)
    client.on('CB:action,,battery', handler.battery)
    client.on('group-participants-update', handler.gcmember)
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//RUNTIME COUNT on Business profile description
const count = async () => {
    while (true) {
        await sleep(1000)
        waktus = moment.tz('Asia/Makassar').startOf('day').seconds(process.uptime()).format('HH:mm:ss')
        client.setStatus(`Bot Telah Aktif Selama: ${waktus}`)
    }
}

loadPlugin()
starts()
startHandler()

//HOSTS INFO (only android)
if (os.platform() == "android") {
    termux = async () => {
        let battery
        let infophone
        try {
            battery = await exec('termux-battery-status')
        } catch (e) {
            battery = e
        } finally {}

        try {
            infophone = await exec('neofetch --json')
        } catch (e) {
            infophone = e
        } finally {}

        global.db.bot.host = {
            device: {
                info: JSON.parse(infophone.stdout),
                battery: JSON.parse(battery.stdout)
            }
        }
    }
    (async () => {
        while (true) {
            termux()
            await sleep(5000)
        }
    })()
}