const baileys = require("@adiwajshing/baileys")
const util = require("util")


const command = async (data) => {
    try {
        if (!data.chat.message.quoted().key) client.sendMessage(data.from, { text: 'Reply some message' }, { quoted: data.chat })
        if (!data.args[0]) client.sendMessage(data.from, { text: 'Where the emoji??' },{ quoted: data.chat })
        const react = new baileys.proto.ReactionMessage.create({})

        react.key = data.chat.message.quoted().key
        react.text = data.args[0]
        react.senderTimestampMs = {
            low: 12345678,
            high: 0,
            unsigned: false
        }

        let result = client.relayMessage(data.from, {
            reactionMessage: react
        }, { messageId: data.chat.message.quoted().key.id })
        
        if (result) client.sendMessage(data.from, { text: 'Done...' },{ quoted: data.chat })
        
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
command.name = 'React';
command.help = ['react'].map(v => v + " *<[R:message]> <emoji>*");
command.tags = ['utility'];
command.use = (/^react$/i);

//OPTION
command.disable = false;
command.beta = false;
command.support = {
    android: true,
    linux: true,
    windows: true
}

module.exports = command;