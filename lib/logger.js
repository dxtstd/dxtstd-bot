const util = require("util")
const moment = require('moment-timezone')
const chalk = require('chalk')

const color = (text, color) => {
    return !color ? chalk.green(text) : chalk.keyword(color)(text)
}

const bgcolor = (text, bgcolor) => {
    return !bgcolor ? chalk.green(text) : chalk.bgKeyword(bgcolor)(text)
}


colors = ['red', 'white', 'black', 'blue', 'yellow', 'green', 'aqua', 'cyan']

//CONNECTION

const qr = function () {
    time = moment.tz('Asia/Makassar').format('HH:mm:ss')
    
    skeet = time
    + color(' [  QR  ] ', 'yellow')
    + 'Scan This QR...'
    console.log(skeet)
}

const connecting = function () {
    time = moment.tz('Asia/Makassar').format('HH:mm:ss')
    
    skeet = time
    + color(' [  CONNECTION  ] ', 'red')
    + "Connecting To WhatsApp Web..."
    console.log(skeet)
}

const connected = function () {
    time = moment.tz('Asia/Makassar').format('HH:mm:ss')
    
    skeet = time
    + color(' [  CONNECTION  ] ', 'lime')
    + "Connected!"
    console.log(skeet)
}

//CHAT UPDATE

const pc = function (text, user, type) {
    time = moment.tz('Asia/Makassar').format('HH:mm:ss')
    
    skeet = time
    + color(' [  PRIVATE  ] ', 'cyan')
    + '"' + text + '"'
    + color(' From ', 'yellow')
    + user
    + color(`, MessageType: ${type}`, `lime`)
    console.log(skeet)
}

const cmdpc = function (text, user, type) {
    time = moment.tz('Asia/Makassar').format('HH:mm:ss')
    
    skeet = time
    + color(' [  COMMAND  ] ', 'cyan')
    + '"' + text + '"'
    + color(' From: ', 'yellow')
    + user
    + color(`, MessageType: ${type}`, `lime`)
    console.log(skeet)
}

const gc = function (text, user, group, type) {
    time = moment.tz('Asia/Makassar').format('HH:mm:ss')
    
    skeet = time
    + color(' [  GROUP  ] ', 'cyan')
    + '"' + text + '"'
    + color(' From: ', 'yellow')
    + user
    + color(', In Group: ', 'yellow')
    + group
    + color(`, MessageType: ${type}`, `lime`)
    console.log(skeet)
}

const cmdgc = function (text, user, group, type) {
    time = moment.tz('Asia/Makassar').format('HH:mm:ss')
    
    skeet = time
    + color(' [  COMMAND  ] ', 'cyan')
    + '"' + text + '"'
    + color(' From: ', 'yellow')
    + user
    + color(', In Group: ', 'yellow')
    + group
    + color(`, MessageType: ${type}`, `lime`)
    console.log(skeet)
}

//WARN

const error = function (error) {
    time = moment.tz('Asia/Makassar').format('HH:mm:ss')
    
    skeet = time
    + color(' [  ERROR  ] ', 'red')
    + `${util.format(error)}`

    console.log(skeet)
}

module.exports = {
    //CONNECTION
    qr,
    connecting,
    connected,
    //CHAT-UPDATE
    pc,
    cmdpc,
    gc,
    cmdgc,
    //
    error
}
