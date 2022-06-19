const fs = require("fs");
const util = require('util');
const moment = require("moment-timezone");
const path = require("path");
const simple = require('../lib/simple.js')

markTime = function () {
    return moment.tz(config.timezone);
};

module.exports = async (chat) => {
    try {
        if (!chat) return;
        console.log(simple.schat(chat))
    } catch (e) {
        
    }
}