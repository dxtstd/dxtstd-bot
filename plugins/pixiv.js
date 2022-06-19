const fs = require('fs')
const util = require('util');
const scrapper = require(dir.lib + 'scrapper.js')
const readmore = require(dir.lib + 'readmore.js')
const axios = require('axios')

const command = async (data) => {
    try {
        const pixiv = new scrapper.pixiv()
        
        let hasil = await pixiv.search(data.args.join(" "))
        
        if (hasil.error) return client.sendMessage(data.from, { text: " The keyword does not exist!" }, { quoted: data.chat });
        const arrayIllust = hasil.body.illust.data
        
        const random = Math.floor(Math.random() * (arrayIllust.length > 50 ? 50: arrayIllust.length))
        
        
        if (!arrayIllust[random]) return client.sendMessage(data.from, { text: " The keyword does not exist!" }, { quoted: data.chat });;
        let illust = await pixiv.illust(arrayIllust[random].id)
        
        const res = await axios({
            method: "get",
            url: illust.body.urls.original,
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1,
                'path': illust.body.urls.original.replace("https://i.pximg.net", ""),
                'authority': "i.pximg.net",
                'referer': 'https://www.pixiv.net/'
                
            },
            responseType: 'arraybuffer'
        })
        
        
        /*
        title
description
viewCount
createDate
userName
        */
        let teksP = "*PIXIV*"
                      + `\n`
               + `\n` + `*TITLE*: ${illust.body.title}`
               + `\n` + `*DESCRIPTION*: ${illust.body.description}`
               + `\n` + `*VIEWER*: ${illust.body.viewCount}`
               + `\n` + `*AUTHOR*: ${illust.bodyuserName}`
               + `\n` + `*POST*: https://www.pixiv.net/artworks/${arrayIllust[random].id}`
        client.sendMessage(data.from, { image: res.data, caption: teksP }, { quoted: data.chat })
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
//NEED
command.need = {
    register: false,
    limit: {
        amount: 0
    },
    cash: {
        amount: 0
    },
    level: 0
};
//INFO
command.name = 'Pixiv';
command.help = ['pixiv'].map(v => v + " *<keyword>*");
command.tags = ['downloader'];
command.use = (/^pixiv$/i);

//OPTION
command.disable = false;
command.beta = false;
command.support = {
    android: true,
    linux: true,
    windows: true
};

module.exports = command;
