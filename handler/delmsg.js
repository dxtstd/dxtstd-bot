module.exports = async (message) => {
    if (message.presences) return
    if (message.hasNewMessage) return
    if (!JSON.parse(JSON.stringify(message)).messages) return
    msg = JSON.parse(JSON.stringify(message)).messages[0]
    if (msg.key.fromMe) return
    try {
        let dmsg
        if (msg.messageStubType == 'REVOKE') {
            for (let i = 0; i <= global.db.chats.length; i++) {
                if (!global.db.chats[i]) {} else {
                    bdmsg = global.db.chats[i]
                    if (bdmsg.key.id === msg.key.id) {
                        dmsg = bdmsg
                    }
                }
            }
        }
        if (dmsg) return
        dmsg.message = (Object.keys(chat.message)[0] === 'ephemeralMessage') ? dmsg.message.ephemeralMessage.message: dmsg.message

        const type = Object.keys(chat.message)[0]
        const from = chat.key.remoteJid
    } catch (e) {
        logger.error(e)
    }
}