const fs = require('fs')
const util = require('util')
const path = require('path')
const moment = require('moment-timezone')

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json')))

let TIME = moment.tz(config.timezone)

const logger = {
    log: "",
    save: function () {
        fs.writeFileSync(path.join(__dirname, `../log/${TIME}.log`), this.log)
    },
    time: function () {
        return moment.tz("Asia/Makassar").format("HH:mm:ss, DD/MM/YYYY")
    },
    info: function (input) {
        this.log += `${this.time()} [=== INFO ===] ${util.format(input)}\n\n`
        this.save()
    },
    warn: function (input) {
        this.log += `${this.time()} [=== WARN ===] ${util.format(input)}\n\n`
        this.save()
    },
    debug: function (input) {
        this.log += `${this.time()} [=== DEBUG ===] ${util.format(input)}\n\n`
        this.save()
    },
    error: function (input) {
        this.log += `${this.time()} [=== ERROR ===] ${util.format(input)}\n\n`
        this.save()
    },
    trace: function (input) {
        this.log += `${this.time()} [=== TRACE ===] ${util.format(input)}\n\n`
        this.save()
    },
    child: function (...input) {
        let children = input
        this.log += `${this.time()} [=== CHILD ===] ${util.format(input)}\n\n`
        this.save()
        return {...this, children }
    }
}



module.exports = logger