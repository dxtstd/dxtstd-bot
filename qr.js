const qrcode = require('qrcode')
const fs = require('fs')

const generate = async function (input) {
    rawData = await qrcode.toDataURL(input, { scale: 8 })
    dataBase64 = rawData.replace(/^data:image\/png;base64,/, "")
    fs.writeFileSync('qrcode.png', dataBase64, 'base64')
    console.log("Success generate image qr")
}

module.exports = generate