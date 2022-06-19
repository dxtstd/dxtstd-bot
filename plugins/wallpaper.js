const scrapper = require(dir.lib + 'scrapper.js')
const fetcher = require(dir.lib + 'fetcher.js')
const util = require('util')

const command = async (data) => {
    try {
        if (!data.args[0]) return client.sendMessage(data.from, { text: 'Keyword nya mana?!' }, { quoted: data.chat });
        await client.sendMessage(data.from, { text: 'Sedang di proses...' }, { quoted: data.chat });
        
        
        let arrayWP = await scrapper.wallpaper(data.args.join(' '))
        
        var randomWP = Math.floor(Math.random() * arrayWP.length)
        let text_WP = `${arrayWP[randomWP].title}\n\nQuery: ${randomWP}/${arrayWP.length}\nSource: Alpha Coders`
        
        let buffWP = await fetcher.getBuffer(arrayWP[randomWP].url)
        await client.sendMessage(data.from, { image: buffWP, caption: text_WP }, { quoted: data.chat })
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
        bot: false,
        normal: false,
        super: false
    },
    premium: false,
    group: false,
    private: false
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
command.name = 'Wallpapet'
command.help = ['wallpaper'].map(v => v + " *<keyword>*")
command.tags = ['downloader']
command.use = (/^wallpaper$/i)

//OPTION
command.disable = false
command.beta = false
command.support = {
    android: true,
    linux: true,
    windows: false
}

module.exports = command