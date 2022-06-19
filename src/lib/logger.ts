import pino from "pino"
import chalk from "chalk"
import * as moment from 'moment-timezone'
import * as fs from "fs"
import * as path from "path"

const config = JSON.parse(String(fs.readFileSync(path.resolve(__dirname, '../../config.json'))))

const coloringText = function (text: string, color: string) {
    return !color ? chalk.keyword('white')(text) : chalk.keyword(color)(text)
}

const coloringBGText = function (text: string, color: string) {
    return !color ? chalk.bgKeyword('white')(text) : chalk.bgKeyword(color)(text)
}

//const colors = ['red', 'white', 'black', 'blue', 'yellow', 'green', 'aqua', 'cyan']

//LOGGER
const pinoLevel = function (logLevel: any) {
    if (logLevel == 31) {
        return coloringText("[  " + "MESSAGE" + "  ]", 'cyan')
    } else if (logLevel == 32) {
        return coloringText("[  " + "COMMAND" + "  ]", 'cyan')
    }

    if (logLevel == 10) {
        return coloringText(("[  " + "TRACE" + "  ]"), 'yellow')
    } else if (logLevel == 20) {
        return coloringText(("[  " + "DEBUG" + "  ]"), 'yellow')
    } else if (logLevel == 30) {
        return coloringText(("[  " + "INFO" + "  ]"), 'lime')
    } else if (logLevel == 40) {
        return coloringText(("[  " + "WARN" + "  ]"), 'yellow')
    } else if (logLevel == 50) {
        return coloringText(("[  " + "ERROR" + "  ]"), 'red')
    } else if (logLevel == 60) {
        return coloringBGText(("[  " + "FATAL" + "  ]"), 'red')
    } else {
        return coloringText(("[  " + "USERLVL" + "  ]"), 'white')
    }


}


const customPino = {
    time: () => moment.tz(config.timezone).format('HH:mm:ss'),
    level: (levelLog: any) => pinoLevel(levelLog) 
}

const msgFormatPino = function (logPino: any) {
    //console.log(logPino)
    const msg = logPino.msg
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

export {
    PINO as logger
}
