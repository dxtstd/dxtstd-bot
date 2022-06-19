//!/usr/bin/node
const fs = require('fs')

const scrapper = require('./scrapper.js');
const NH = new scrapper.NHentai();

(async () => {
    HASIL = await NH.download('https://nhentai.net/g/390467/')
    console.log(HASIL)
    fs.writeFileSync('doujin.pdf', HASIL)
})()
