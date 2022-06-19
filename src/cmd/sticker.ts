import * as util from 'util'
import * as crypto from 'crypto'

import { sticker } from '../lib'
import { CommandType } from '../types'

const command: CommandType = {} as CommandType
command.default = async (client, { data, database }, logger) => {
    try {
        let msg;
        if (data.chat.is.media) msg = data.chat;
        !msg && data.chat.is.quoted ? (msg = data.chat.message.quoted()) : (msg = data.chat);
        
        let isMedia: boolean = false
        if (/image/.test(msg.message.type)) isMedia = true ;
        else if (/video/.test(msg.message.type)) isMedia = true;
        else if (/document/.test(msg.message.type)) {
            const document = msg.message[msg.message.type]
            if (document.mimetype.startsWith('image')) {
                if (document.fileLength > 5000000) {
                    let text = 'The file must be under 5 mb!'
                    return client.sendMessage(data.from, { text: text }, { quoted: data.chat })
                } else isMedia = true
            } else if (document.mimetype.startsWith('video')) {
                if (document.fileLength > 1000000) {
                    let text = 'The file must be under 1 mb!'
                    return client.sendMessage(data.from, { text: text }, { quoted: data.chat })
                } else isMedia = true
            }
        }
        
        if (!isMedia) return client.sendMessage(data.from, { text: 'Media must be images/videos' }, { quoted: data.chat })
        const media = await msg.download({ stream: true })
        
        const webp = await sticker.toWEBP(media)
        
        const json = {} as any
        json['sticker-pack-id'] = crypto.randomBytes(32).toString('hex')
        json['sticker-pack-name'] = (data.text.body ? data.text.body : data.name.user )
        json['sticker-pack-publisher'] = (data.text.body ? (data.name.user + ' | ' + 'dxtstd-bot') : ('dxtstd-bot'))
        
        const result = await sticker.addExif(webp, json)
        client.sendMessage(data.from, { sticker: result }, { quoted: data.chat })
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
command.name = 'sticker'
command.help = ['sticker'].map(v => v + ' ');
command.category = 'utility'
command.use = /^s(tic?ker)$/i;

//OPTION
command.disable = {
    active: false,
    reason: ''
};
command.beta = false;
command.support = {
    android: true,
    linux: true,
    windows: true
};

module.exports = command;
