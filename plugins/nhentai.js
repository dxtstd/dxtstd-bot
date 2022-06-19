const puppeteer = require('puppeteer');
const fs = require('fs')
const util = require('util');
const scrapper = require(dir.lib + 'scrapper.js')
const readmore = require(dir.lib + 'readmore.js')

const isUrl = function (url) {
     return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
}

const command = async (data) => {
    try {
        const screenshotWeb = async function (URL) {
            const browser = await puppeteer.launch({
                args: ['--no-sandbox']
            })
            try {
                let pageBrowser = await browser.newPage()
                await pageBrowser.setViewport({
                    width: 1280,
                    height: 720,
                    deviceScaleFactor: 1,
                })
                await pageBrowser.setDefaultNavigationTimeout(0);
                await pageBrowser.setExtraHTTPHeaders({
                    dnt: "1",
                    cookie: "cf_clearance=I5z8FRd_NFTzA1gh6qPi4HW3fabUc8ZBzTC3VRXaqLw-1652648637-0-150; csrftoken=HyIwAET1ys9EtwZwjfyZiwFKecFwik6rTTcGkBxRtDBGUmgQLvNQZN9xFtfq3JdQ", 
                    "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36",
                    "upgrade-insecure-requests": "1"
                })
                await pageBrowser.goto(URL)
                let screenshot = await pageBrowser.screenshot()

                await browser.close()
        
                return screenshot
            } catch (e) {
                await browser.close()
                throw e
            }
        }
        const NHentai = new scrapper.NHentai()
        const command = data.args[0]
        if (command === 'info') {
            client.sendMessage(data.from, { text: "Sedang di proses..." }, { quoted: data.chat })
            
            const resultNH = await NHentai.getInfo(data.args[1])
            let teks = `NHentai`
            + `\n`
            + `\n` + `*[   INFO   ]*`
            + `\n` + `> *TITLE* : ${(resultNH.title.english ? resultNH.title.english: (resultNH.title.japanese ? resultNH.title.japanese : resultNH.title.pretty))}`
            + `\n` + `> *PARODY* : ${resultNH.parody}`
            + `\n` + `> *CHARACTER* : ${resultNH.character.join(', ')}`
            + `\n` + `> *TAG* : ${resultNH.tag.join(', ')}`
            + `\n` + `> *ARTIST* : ${resultNH.artist}`
            + `\n` + `> *GROUP* : ${resultNH.group}`
            + `\n` + `> *LANGUAGE* : ${resultNH.language.join(', ')}`
            + `\n` + `> *PAGE* : ${resultNH.num_pages}`
            + `\n` + `> *UPLOADED* : ${resultNH.uploaded}`
            + `\n` + `> *LINK* : https://nhentai.net/g/${resultNH.id}`
            client.sendMessage(data.from, { image: await screenshotWeb(`https://nhentai.net/g/${resultNH.id}`), caption: teks }, { quoted: data.chat })
        } else if (command === 'search') {
            client.sendMessage(data.from, { text: "Sedang di proses..." }, { quoted: data.chat })
            
            data.args.shift()
            const resultNH = await NHentai.search.keyword(data.args.join(" "), 1)
            let kumpulanTeks = `NHentai`
            + `\n`
            + `\n` + `*[   INFO   ] 1/${resultNH.length} DOUJIN*`
            + `\n` + `> *TITLE* : ${(resultNH[0].title.english ? resultNH[0].title.english: (resultNH[0].title.japanese ? resultNH[0].title.japanese : resultNH[0].title.pretty))}`
            + `\n` + `> *PARODY* : ${resultNH[0].parody}`
            + `\n` + `> *CHARACTER* : ${resultNH[0].character.join(', ')}`
            + `\n` + `> *TAG* : ${resultNH[0].tag.join(', ')}`
            + `\n` + `> *ARTIST* : ${resultNH[0].artist}`
            + `\n` + `> *GROUP* : ${resultNH[0].group}`
            + `\n` + `> *LANGUAGE* : ${resultNH[0].language.join(', ')}`
            + `\n` + `> *PAGE* : ${resultNH[0].num_pages}`
            + `\n` + `> *UPLOADED* : ${resultNH[0].uploaded}`
            + `\n` + `> *LINK* : https://nhentai.net/g/${resultNH[0].id}`
            + `\n`
            + `\n` + `Untuk yang lain nya, klik baca selengkapnya dibawah ini`
            + `\n` + readmore

            resultNH.shift()
            var x = 1
            for (var i in resultNH) {
                x ++
                kumpulanTeks += `\n` + `*[   INFO   ] ${x}/${Math.floor(resultNH.length  + 1)} DOUJIN*`
                + `\n` + `> *TITLE* : ${(resultNH[i].title.english ? resultNH[i].title.english: (resultNH[i].title.japanese ? resultNH[i].title.japanese : resultNH[i].title.pretty))}`
                + `\n` + `> *PARODY* : ${resultNH[i].parody}`
                + `\n` + `> *CHARACTER* : ${resultNH[i].character.join(', ')}`
                + `\n` + `> *TAG* : ${resultNH[i].tag.join(', ')}`
                + `\n` + `> *ARTIST* : ${resultNH[i].artist}`
                + `\n` + `> *GROUP* : ${resultNH[i].group}`
                + `\n` + `> *LANGUAGE* : ${resultNH[i].language.join(', ')}`
                + `\n` + `> *PAGE* : ${resultNH[i].num_pages}`
                + `\n` + `> *UPLOADED* : ${resultNH[i].uploaded}`
                + `\n` + `> *LINK* : https://nhentai.net/g/${resultNH[i].id}`
                + `\n`
            }
            client.sendMessage(data.from, { image: await screenshotWeb('https://nhentai.net/search?q=' + encodeURIComponent(data.args.join(" ")) + "&page=1"), caption: kumpulanTeks }, { quoted: data.chat })
        } else if (command === 'tag') {
            client.sendMessage(data.from, { text: "Sedang di proses..." }, { quoted: data.chat })
            
            data.args.shift()
            const resultNH = await NHentai.search.tag(data.args.join(" "), 1)
            let kumpulanTeks = `NHentai`
            + `\n`
            + `\n` + `*[   INFO   ] 1/${resultNH.length} DOUJIN*`
            + `\n` + `> *TITLE* : ${(resultNH[0].title.english ? resultNH[0].title.english: (resultNH[0].title.japanese ? resultNH[0].title.japanese : resultNH[0].title.pretty))}`
            + `\n` + `> *PARODY* : ${resultNH[0].parody}`
            + `\n` + `> *CHARACTER* : ${resultNH[0].character.join(', ')}`
            + `\n` + `> *TAG* : ${resultNH[0].tag.join(', ')}`
            + `\n` + `> *ARTIST* : ${resultNH[0].artist}`
            + `\n` + `> *GROUP* : ${resultNH[0].group}`
            + `\n` + `> *LANGUAGE* : ${resultNH[0].language.join(', ')}`
            + `\n` + `> *PAGE* : ${resultNH[0].num_pages}`
            + `\n` + `> *UPLOADED* : ${resultNH[0].uploaded}`
            + `\n` + `> *LINK* : https://nhentai.net/g/${resultNH[0].id}`
            + `\n`
            + `\n` + `Untuk yang lain nya, klik baca selengkapnya dibawah ini`
            + `\n` + readmore

            resultNH.shift()
            var x = 1
            for (var i in resultNH) {
                x ++
                kumpulanTeks += `\n` + `*[   INFO   ] ${x}/${Math.floor(resultNH.length  + 1)} DOUJIN*`
                + `\n` + `> *TITLE* : ${(resultNH[i].title.english ? resultNH[i].title.english: (resultNH[i].title.japanese ? resultNH[i].title.japanese : resultNH[i].title.pretty))}`
                + `\n` + `> *PARODY* : ${resultNH[i].parody}`
                + `\n` + `> *CHARACTER* : ${resultNH[i].character.join(', ')}`
                + `\n` + `> *TAG* : ${resultNH[i].tag.join(', ')}`
                + `\n` + `> *ARTIST* : ${resultNH[i].artist}`
                + `\n` + `> *GROUP* : ${resultNH[i].group}`
                + `\n` + `> *LANGUAGE* : ${resultNH[i].language.join(', ')}`
                + `\n` + `> *PAGE* : ${resultNH[i].num_pages}`
                + `\n` + `> *UPLOADED* : ${resultNH[i].uploaded}`
                + `\n` + `> *LINK* : https://nhentai.net/g/${resultNH[i].id}`
                + `\n`
            }
            client.sendMessage(data.from, { image: await screenshotWeb('https://nhentai.net/tag/' + encodeURIComponent(data.args.join("-")) + "/?page=1"), caption: kumpulanTeks }, { quoted: data.chat })
        } else if (command === 'character') {
            client.sendMessage(data.from, { text: "Sedang di proses..." }, { quoted: data.chat })
            
            data.args.shift()
            const resultNH = await NHentai.search.char(data.args.join(" "), 1)
            let kumpulanTeks = `NHentai`
            + `\n`
            + `\n` + `*[   INFO   ] 1/${resultNH.length} DOUJIN*`
            + `\n` + `> *TITLE* : ${(resultNH[0].title.english ? resultNH[0].title.english: (resultNH[0].title.japanese ? resultNH[0].title.japanese : resultNH[0].title.pretty))}`
            + `\n` + `> *PARODY* : ${resultNH[0].parody}`
            + `\n` + `> *CHARACTER* : ${resultNH[0].character.join(', ')}`
            + `\n` + `> *TAG* : ${resultNH[0].tag.join(', ')}`
            + `\n` + `> *ARTIST* : ${resultNH[0].artist}`
            + `\n` + `> *GROUP* : ${resultNH[0].group}`
            + `\n` + `> *LANGUAGE* : ${resultNH[0].language.join(', ')}`
            + `\n` + `> *PAGE* : ${resultNH[0].num_pages}`
            + `\n` + `> *UPLOADED* : ${resultNH[0].uploaded}`
            + `\n` + `> *LINK* : https://nhentai.net/g/${resultNH[0].id}`
            + `\n`
            + `\n` + `Untuk yang lain nya, klik baca selengkapnya dibawah ini`
            + `\n` + readmore

            resultNH.shift()
            var x = 1
            for (var i in resultNH) {
                x ++
                kumpulanTeks += `\n` + `*[   INFO   ] ${x}/${Math.floor(resultNH.length  + 1)} DOUJIN*`
                + `\n` + `> *TITLE* : ${(resultNH[i].title.english ? resultNH[i].title.english: (resultNH[i].title.japanese ? resultNH[i].title.japanese : resultNH[i].title.pretty))}`
                + `\n` + `> *PARODY* : ${resultNH[i].parody}`
                + `\n` + `> *CHARACTER* : ${resultNH[i].character.join(', ')}`
                + `\n` + `> *TAG* : ${resultNH[i].tag.join(', ')}`
                + `\n` + `> *ARTIST* : ${resultNH[i].artist}`
                + `\n` + `> *GROUP* : ${resultNH[i].group}`
                + `\n` + `> *LANGUAGE* : ${resultNH[i].language.join(', ')}`
                + `\n` + `> *PAGE* : ${resultNH[i].num_pages}`
                + `\n` + `> *UPLOADED* : ${resultNH[i].uploaded}`
                + `\n` + `> *LINK* : https://nhentai.net/g/${resultNH[i].id}`
                + `\n`
            }
            client.sendMessage(data.from, { image: await screenshotWeb('https://nhentai.net/character/' + encodeURIComponent(data.args.join("-")) + "/?page=1"), caption: kumpulanTeks }, { quoted: data.chat })
        } else if (command === 'download') {
            client.sendMessage(data.from, { text: "Sedang di proses..." }, { quoted: data.chat })
            
            const resultNH = await NHentai.getBook(data.args[1])
            
            if (resultNH.page > 100) return client.sendMessage(data.from, { text: "Halaman tidak boleh lebih dari 100" }, { quoted: data.chat })
            
            let teks = `NHentai`
            + `\n`
            + `\n` + `*[   INFO   ]*`
            + `\n` + `> *TITLE* : ${(resultNH.title.english ? resultNH.title.english: (resultNH.title.japanese ? resultNH.title.japanese : resultNH.title.pretty))}`
            + `\n` + `> *PARODY* : ${resultNH.parody}`
            + `\n` + `> *CHARACTER* : ${resultNH.character.join(', ')}`
            + `\n` + `> *TAG* : ${resultNH.tag.join(', ')}`
            + `\n` + `> *ARTIST* : ${resultNH.artist}`
            + `\n` + `> *GROUP* : ${resultNH.group}`
            + `\n` + `> *LANGUAGE* : ${resultNH.language.join(', ')}`
            + `\n` + `> *PAGE* : ${resultNH.num_pages}`
            + `\n` + `> *UPLOADED* : ${resultNH.uploaded}`
            + `\n` + `> *LINK* : https://nhentai.net/g/${resultNH.id}`
            + `\n`
            + `\n` + `> *Catatan*: Tunggu sebentar ya kak, doujin nya lagi di proses`
            client.sendMessage(data.from, { image: { url: resultNH.link.cover }, caption: teks }, { quoted: data.chat })
            
            const downNH = await NHentai.download(resultNH.id)
            
            const fileDoc = { 
                document: downNH,
                mimetype: 'application/pdf',
                fileName: `${(resultNH.title.english ? resultNH.title.english: (resultNH.title.japanese ? resultNH.title.japanese : resultNH.title.pretty))}.pdf`
            }
            
            await client.sendMessage(data.from, fileDoc)
        } else {
            let teks = "NHentai"
            + "\n"
            + "\n" + `> ${config.prefix}${data.command} info <CODE NUKLIR/WEB NHENTAI>`
            + "\n" + `> ${config.prefix}${data.command} search <KEYWORD>`
            + "\n" + `> ${config.prefix}${data.command} character <CHARACTER>`
            + "\n" + `> ${config.prefix}${data.command} tag <TAG NHENTAI>`
            + "\n" + `> ${config.prefix}${data.command} download <CODE NUKLIR/WEB NHENTAI>`
            client.sendMessage(data.from, { text: teks }, { quoted: data.chat })
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
//INFO
command.name = 'NHentai';
command.help = ['nhentai'].map(v => v + " *<type>* *<[keyword|number|link]>*");
command.tags = ['nsfw'];
command.use = (/^nh(entai)?$/i);

//OPTION
command.disable = false;
command.beta = false;
command.support = {
    android: false,
    linux: true,
    windows: false
}

module.exports = command;