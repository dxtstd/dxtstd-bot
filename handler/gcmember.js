const Jimp = require('jimp')
const path = require('path')
const fs = require('fs')

module.exports = async (chat) => {
    mem = chat.participants[0]
    try {
        var pp_user = await client.getProfilePicture(mem)
    } catch (e) {
        var pp_user = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
    }

    pp = await getBuffer(pp_user)

    if (chat.action == 'add') {
        try {
            dir = path.join(__dirname, "..", "/src/group/welcome/")
            file = fs.readdirSync(dir).filter(filename => filename.endsWith('.png'))
            random = Math.floor(Math.random() * file.length)


            //Load File
            image = await Jimp.read(dir + file[random])
            pp = await Jimp.read(pp)
            font = await Jimp.loadFont(path.join(__dirname, "..", "/src/font/Montserrat-Mid.ttf.fnt"))
            //Print Text On Image
            username = client.contacts[mem] != undefined ? client.contacts[mem].notify || client.contacts[mem].vname || client.contacts[mem].name || `+${mem.split("@")[0]}`: undefined
            console.log(username)
            gcInfo = await client.groupMetadata(chat.jid)

            image.print(font, 305, 525, {
                text: username
            }, 2000, 500) //NAME USER
            image.print(font, 382, 613, {
                text: gcInfo.subject
            }, 2000, 500) //NAME GROUPS

            //Picture Profile User
            pp.resize(200, 200) //Resize Picture
            pp.circle() //Crop to circle
            image.blit(pp, 28, 300) //Add to image
            //END

            caption = (`Selamat datang @user di @subject!`).replace("@user", `@${mem.split("@")[0]}`).replace("@subject", gcInfo.subject)

            image = await image.getBufferAsync("image/png")
            client.sendMessage(chat.jid, image, MessageType.image, {
                mimetype: 'image/png', 
                caption: caption, 
                contextInfo: {
                    mentionedJid: [ mem ]
                }
            })
        } catch (e) {
            logger.error(e)
        }
    }
    
    if (chat.action == 'remove') {
        try {
            dir = path.join(__dirname, "..", "/src/group/out/")
            file = fs.readdirSync(dir).filter(filename => filename.endsWith('.png'))
            random = Math.floor(Math.random() * file.length)


            //Load File
            image = await Jimp.read(dir + file[random])
            pp = await Jimp.read(pp)
            font = await Jimp.loadFont(path.join(__dirname, "..", "/src/font/Montserrat-Mid.ttf.fnt"))
            //Print Text On Image
            username = client.contacts[mem] != undefined ? client.contacts[mem].notify || client.contacts[mem].vname || client.contacts[mem].name || `+${mem.split("@")[0]}`: undefined
            console.log(username)
            gcInfo = await client.groupMetadata(chat.jid)

            image.print(font, 305, 525, {
                text: username
            }, 2000, 500) //NAME USER
            image.print(font, 400, 613, {
                text: gcInfo.subject
            }, 2000, 500) //NAME GROUPS

            //Picture Profile User
            pp.resize(200, 200) //Resize Picture
            pp.circle() //Crop to circle
            image.blit(pp, 28, 300) //Add to image
            //END

            caption = (`Selamat tinggal @user dari @subject!`).replace("@user", `@${mem.split("@")[0]}`).replace("@subject", gcInfo.subject)

            image = await image.getBufferAsync("image/png")
            client.sendMessage(chat.jid, image, MessageType.image, {
                mimetype: 'image/png', 
                caption: caption, 
                contextInfo: {
                    mentionedJid: [ mem ]
                }
            })
        } catch (e) {
            logger.error(e)
        }
    }
}