const puppeteer = require('puppeteer');
const util = require('util');

const isUrl = function (url) {
     return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
}

const command = async (data) => {
    try {
        if (!data.args[0]) return client.sendMessage(data.from, { text: 'URL nya mana?!' }, { quoted: data.chat });
        let URL = data.args[0].startsWith('http') ? data.args[0]: 'http://'+data.args[0]
        if (!isUrl(URL)) return client.sendMessage(data.from, { text: 'URL HARUS VALID!' }, { quoted: data.chat });
        
        client.sendMessage(data.from, { text: 'Sedang di proses...' }, { quoted: data.chat });
        const browser = await puppeteer.launch({
            args: ['--no-sandbox']
        })
        try {
            let page = await browser.newPage()
            await page.setViewport({
                width: 1280,
                height: 720,
                deviceScaleFactor: 1,
            })
            
            await page.goto(URL)
            let ss = await page.screenshot()
            
            await browser.close()
            
            client.sendMessage(data.from, {
                image: ss
            }, {
                quoted: data.chat
            })
        } catch (e) {
            client.sendMessage(data.from, {
                text: util.format(e)
            }, {
                quoted: data.chat
            })
            await browser.close()
        }
    } catch (e) {
        logger.error(e)
        client.sendMessage(data.from, {
            text: util.format(e)
        }, {
            quoted: data.chat
        })
    }
};

//PERMISSION
command.permission = {
    owner: false,
    admin: {
        bot: false,
        normal: false,
        super: false
    },
    premium: false,
    group: false,
    private: false
};
command.permission.owner = false;

command.permission.group = false;
command.permission.private = false;

command.permission.admin.bot = false;
command.permission.admin.normal = false;
command.permission.admin.super = false;

command.permission.premium = false;

//NEED
command.need = {
    verified: true,
    limit: {
        amount: 0
    },
    cash: {
        amount: 0
    },
    level: 0
};
command.need.register = true;
command.need.limit.amount = 0;
command.need.cash.amount = 0;
command.need.level = 0;

//INFO
command.name = 'ScreenShot Website';
command.help = ['ssweb'].map(v => v + " *<link>*");
command.tags = ['utility'];
command.use = (/^ssweb$/i);

//OPTION
command.disable = false;
command.beta = false;
command.support = {
    android: false,
    linux: true,
    windows: false
}

module.exports = command;