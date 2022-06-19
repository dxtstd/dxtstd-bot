const fs = require('fs')

module.exports = async (chat) => {
    try {
        if (!chat.hasNewMessage) return
        chat = JSON.parse(JSON.stringify(chat)).messages[0]
        global.db.chats.push(chat)
        if (!chat.message) return
        if (chat.key && chat.key.remoteJid == 'status@broadcast') return
        if (chat.key.fromMe) return

        chat.message = (Object.keys(chat.message)[0] === 'ephemeralMessage') ? chat.message.ephemeralMessage.message: chat.message

        global.db.chat = chat

        const content = JSON.stringify(chat.message)
        const from = chat.key.remoteJid
        const type = Object.keys(chat.message)[0]
        const insom = from.endsWith('@g.us')
        const nameReq = insom ? chat.participant: chat.key.remoteJid
        const username = client.contacts[nameReq] != undefined ? client.contacts[nameReq].vname || client.contacts[nameReq].notify: undefined
        client.chatRead(from)

        text = (type === 'conversation' && chat.message.conversation) ? chat.message.conversation: (type == 'imageMessage') && chat.message.imageMessage.caption ? (chat.message.imageMessage.caption || '') : (type == 'videoMessage') && chat.message.videoMessage.caption ? chat.message.videoMessage.caption : (type == 'extendedTextMessage') && chat.message.extendedTextMessage.text ? chat.message.extendedTextMessage.text : ''

        const command = text.slice(1).trim().split(/ +/).shift().toLowerCase()
        const args = text.trim().split(/ +/).slice(1)
        const isCmd = text.startsWith(prefix)

        const botnumber = client.user.jid
        const isGroup = from.endsWith('@g.us')
        const sender = isGroup ? chat.participant: chat.key.remoteJid
        const groupMetadata = isGroup ? await client.groupMetadata(from): ''
        const groupname = isGroup ? groupMetadata.subject : ''

        const isOwner = sender.split('@')[0] === owner

        const reply = (teks) => {
            client.sendMessage(from, teks, MessageType.text, {
                quoted: chat
            })
        }

        if (!isCmd && !isGroup) logger.pc(text, username, type)
        if (isCmd && !isGroup) logger.cmdpc(text, username, type)
        if (!isCmd && isGroup) logger.gc(text, username, groupname, type)
        if (isCmd && isGroup) logger.cmdgc(text, username, groupname, type)

        if (isCmd) {
            global.db.data = {
                chat: chat,
                type: type,
                from: from,
                sender: sender,
                text: text,
                command: command,
                args: args,
                groupname: groupname,
                username: username,
                sender: sender
            }
            let plugin
            for (let name in global.plugins) {
                plug = global.plugins[name]
                for (i in plug.command) {
                    if (plug.command[i] === command) {
                        plugin = plug
                    }
                }
            }
            if (plugin == undefined) return reply('perintah apaan tuh? ga ada di bot saya')
            if (plugin.owner && !isOwner) return reply('only owner')
            if (plugin.group && !isGroup) return reply()
            plugin.call()
        }
    } catch (e) {
        logger.error(e)
    }
}