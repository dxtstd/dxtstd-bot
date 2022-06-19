const fs = require('fs')
const util = require('util');
const scrapper = require(dir.lib + 'scrapper.js')
const readmore = require(dir.lib + 'readmore.js')

let command = async (data) => {
    try {
        if (data.args.length == 0) return client.sendMessage(data.from, { text: 'Keyword nya mana?' }, { quoted: data.chat })
        const pinter = new scrapper.Pinterest()
        
        if (/https?:\/\/(www\.)?pinterest.com\/pin\//.test(data.args[0])) {
            const hasilP = await pinter.getInfo(data.args[0])
            let teksP = "*PINTEREST*"
                      + `\n`
               + `\n` + `*TITLE*: ${hasilP.title}`
               + `\n` + `*POST*: ${hasilP.link.post}`
               
               await client.sendMessage(data.from, { image: { url: hasilP.link.image }, caption: teksP }, { quoted: data.chat })
        } else {
            const hasilP = await pinter.search(data.args.join(" "))
            var i = Math.floor(Math.random() * hasilP.length)
            let teksP = "*PINTEREST*"
                      + `\n`
               + `\n` + `*TITLE*: ${hasilP[i].title}`
               + `\n` + `*DESCRIPTION*: ${hasilP[i].description}`
               + `\n` + `*POST*: ${hasilP[i].link.post}`
               
               await client.sendMessage(data.from, { image: { url: hasilP[i].link.image }, caption: teksP }, { quoted: data.chat })
        }
    } catch (e) {
        logger.error(e)
        client.sendMessage(data.from, {
            text: util.format(e)
        }, {
            quoted: data.chat
        })
    }
}


//PERMISSION
command.permission = {
    owner: false,
    admin: {
        normal: false,
        super: false
    },
    premium: false,
    group: false
}
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
}
//INFO
command.name = 'Pinterest'
command.help = ['pinterest'].map(v => v + " *<[keyword|link]>*")
command.tags = ['downloader']
command.use = (/^pinterest$/i)

//OPTION
command.disable = false
command.beta = false
command.support = {
    android: true,
    linux: true,
    windows: true
}

module.exports = command
