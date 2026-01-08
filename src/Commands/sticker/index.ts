import * as util from 'util'
import * as crypto from 'crypto'

import { sticker } from '../../Utils'

export async function callback(bot, m, text): Promise<any> {
    
    try {
        const msg = m.quoted ?? m;
        let isMedia: boolean = false
        if (/image/.test(msg.type)) isMedia = true;
        else if (/sticker/.test(msg.type)) isMedia = true;
        else if (/video/.test(msg.type)) isMedia = true;
        else if (/document/.test(msg.type)) {
            const document = msg.message[msg.type]
            if (document.mimetype.startsWith('image')) {
                if (document.fileLength > 5000000) {
                    let text = 'The file must be under 5 mb!'
                    return bot.sock.sendMessage(m.from, { text: text }, { quoted: m })
                } else isMedia = true
            } else if (document.mimetype.startsWith('video')) {
                if (document.fileLength > 1000000) {
                    let text = 'The file must be under 1 mb!'
                    return bot.sock.sendMessage(m.from, { text: text }, { quoted: m })
                } else isMedia = true
            }
        }
        
        if (!isMedia) return bot.sock.sendMessage(m.from, { text: 'Media must be images/videos' }, { quoted: m.chat })
        const media = await msg.download({ stream: true })
        const webp = await sticker.toWEBP(media)
        
        const json = {} as any
        json['sticker-pack-id'] = crypto.randomBytes(32).toString('hex')
        json['sticker-pack-name'] = (m.text.body ? m.text.body : (!!m.user.config.swm ? m.user.config.swm : m.name.user))
        //json['sticker-pack-publisher'] = (data.text.body ? (data.name.user + ' | ' + 'dxtstd-bot') : ('dxtstd-bot'))
        
        const result = await sticker.addExif(webp, json)
        
        bot.sock.sendMessage(m.from, { sticker: result }, { quoted: m })
    } catch (error) {
        bot.logger.error(error)
    }
}

export * as help from './help'

export const metadata = {
    name: 'sticker',
    category: 'utility'
}

export var requirement = {
    
}

export const trigger = (/^s(tic?ker)?$/i)