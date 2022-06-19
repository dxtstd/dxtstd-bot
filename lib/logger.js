const util = require("util")
const pino = require('pino')
const moment = require('moment-timezone')
const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json')))

const color = (text, color) => {
    return !color ? chalk.green(text) : chalk.keyword(color)(text)
}

const bgcolor = (text, bgcolor) => {
    return !bgcolor ? chalk.green(text) : chalk.bgKeyword(bgcolor)(text)
}


const colors = ['red', 'white', 'black', 'blue', 'yellow', 'green', 'aqua', 'cyan']

//LOGGER
const pinoLevel = function (logLevel) {
    if (logLevel == 31) {
        return color("[  " + "MESSAGE" + "  ]", 'cyan')
    } else if (logLevel == 32) {
        return color("[  " + "COMMAND" + "  ]", 'cyan')
    }
    
    if (logLevel == 10) {
        return color(("[  " + "TRACE" + "  ]"), 'yellow')
    } else if (logLevel == 20) {
        return color(("[  " + "DEBUG" + "  ]"), 'yellow')
    } else if (logLevel == 30) {
        return color(("[  " + "INFO" + "  ]"), 'lime')
    } else if (logLevel == 40) {
        return color(("[  " + "WARN" + "  ]"), 'yellow')
    } else if (logLevel == 50) {
        return color(("[  " + "ERROR" + "  ]"), 'red')
    } else if (logLevel == 60) {
        return bgcolor(("[ " + "FATAL" + "  ]"), 'red')
    } else {
        return color(("[  " + "USERLVL" + "  ]"), 'white')
    }
    
    
}


const customPino = {
    time: timestamp => moment.tz(config.timezone).format('HH:mm:ss'),
    level: levelLog => pinoLevel(levelLog)
}

const msgFormatPino = function (logPino) {
    //console.log(logPino)
    let msg = logPino.msg
    return msg
}

const PINO = pino({
    customLevels: {
        message: 31,
        command: 32
    },
    prettyPrint: {
        levelFirst: false,
        colorize: true,
        ignore: 'pid,hostname',
        messageFormat: msgFormatPino,
        customPrettifiers: customPino
    }
})

module.exports = PINO