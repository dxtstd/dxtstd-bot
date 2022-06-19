const fetcher = require('../lib/fetcher.js')
const fs = require('fs')
const Jimp = require('jimp')

module.exports = async (group) => {
    try {
        const groupdata = global.db.groups[group.id]
        if (!groupdata.config.greeting.status) return;
        
        if (group.action == 'add') {
            let username;
            let manyParticipant = false;
            if (group.participants.length > 1) username = `${group.participants.length} Participant...`, manyParticipant = true;
            else if (group.participants.length == 1) username = global.db.users[group.participants[0]] ? global.db.users[group.participants[0]].profile.name.saved || global.db.users[group.participants[0]].profile.name.notify : `+${group.participants[0].split('@')[0]}`;
            let pp_user = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
            try {
                pp_user = manyParticipant ? (pp_user) : (await client.profilePictureUrl(group.participants[0], 'image'))
            } catch (e) {
                
            }
            
            let dirImg = dir.assets + "group/welcome/"
            let file = fs.readdirSync(dirImg).filter(filename => filename.endsWith('.png'))
            var random = Math.floor(Math.random() * file.length)
            
            const ppBuff = await fetcher.getBuffer(pp_user)
            
            //Load File
            let image = await Jimp.read(dirImg + file[random])
            let ppImg = await Jimp.read(ppBuff)
            let font = await Jimp.loadFont(dir.assets + "font/Montserrat-Mid.ttf.fnt")
            
            image.print(font, 305, 525, {
                text: username
            }, 2000, 500) //NAME USER
            image.print(font, 382, 613, {
                text: groupdata.subject
            }, 2000, 500) //NAME GROUPS
            
            //Picture Profile User
            ppImg.resize(200, 200) //Resize Picture
            ppImg.circle() //Crop to circle
            image.blit(ppImg, 28, 300) //Add to image
            image.resize(Math.floor(1270*0.8), Math.floor(720*0.8))
            //END 
            
            let caption = ((groupdata.config.greeting.welcome).replace('@user', (manyParticipant? username : '@' + group.participants[0].split('@')[0]))).replace('@subject', groupdata.subject)
            
            const imageJimp = await image.getBufferAsync("image/png")
            await client.sendMessage(group.id, { image: imageJimp, mimetype: 'image/png', caption: caption, contextInfo: { mentionedJid: group.participants } })
             
        } else if (group.action == 'remove') {
            let username;
            let manyParticipant = false;
            if (group.participants.length > 1) username = `${group.participants.length} Participant...`, manyParticipant = true;
            else if (group.participants.length == 1) username = global.db.users[group.participants[0]] ? global.db.users[group.participants[0]].profile.name.saved || global.db.users[group.participants[0]].profile.name.notify : `+${group.participants[0].split('@')[0]}`;
            
            let pp_user = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
            try {
                pp_user = manyParticipant ? (pp_user) : (await client.profilePictureUrl(group.participants[0], 'image'))
            } catch (e) {
                
            }
            
            let dirImg = dir.assets + "group/out/"
            let file = fs.readdirSync(dirImg).filter(filename => filename.endsWith('.png'))
            var random = Math.floor(Math.random() * file.length)
            
            const ppBuff = await fetcher.getBuffer(pp_user)
            
            //Load File
            let image = await Jimp.read(dirImg + file[random])
            let ppImg = await Jimp.read(ppBuff)
            let font = await Jimp.loadFont(dir.assets + "font/Montserrat-Mid.ttf.fnt")
            
            image.print(font, 305, 525, {
                text: username
            }, 2000, 500) //NAME USER
            image.print(font, 400, 613, {
                text: groupdata.subject
            }, 2000, 500) //NAME GROUPS
            
            //Picture Profile User
            ppImg.resize(200, 200) //Resize Picture
            ppImg.circle() //Crop to circle
            image.blit(ppImg, 28, 300) //Add to image
            image.resize(Math.floor(1270*0.8), Math.floor(720*0.8))
            //END 
            
            let caption = ((groupdata.config.greeting.leave).replace('@user', (manyParticipant? username : '@' + group.participants[0].split('@')[0]))).replace('@subject', groupdata.subject)
            
            const imageJimp = await image.getBufferAsync("image/png")
            await client.sendMessage(group.id, { image: imageJimp, mimetype: 'image/png', caption: caption, contextInfo: { mentionedJid: group.participants } })
            
        }
    } catch (e) {
        logger.error(e)
    }
}