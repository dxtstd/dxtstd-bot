import { scrapper, fetcher } from '../../Utils'

export async function callback(bot, m, text): Promise<any> {
    return new Promise((resolve, reject) => {
        bot.setTimeout(reject)
        
        const msg = m.quoted ?? m
        
        let isMedia: boolean = false
        if (/image/.test(msg.type)) isMedia = true;
        else if (/sticker/.test(msg.type)) isMedia = true;
        
        if (!isMedia) {
            m.reply({
                text: 'Media must be image'
            })
            .then(resolve)
            .catch(reject)
            
            return
        }
        
        m.reply({ text: "waitos, being processed.." })
        .catch(reject)
        
        msg.download()
        .then(media => {
            return scrapper.toanime.draw_proxyed(media)
            .then(({ results }) => fetcher.getBuffer(results[0]))
            .then(image_anime => {
                if (m.text.args[0] == 'crop' || m.text.args[0] == '-c') {
                     return scrapper.toanime.crop(image_anime)
                } else return image_anime
            })
        })
        .then(image => {
            m.reply({
                image,
                mimetype: "image/jpeg",
                caption: "selamat yo, panjenengan wis dadi anime!"
            })
            .then(resolve)
            .catch(reject)
        })
        .catch(reject)
    })
}

export * as help from './help'

export const metadata = {
    name: 'toanime',
    category: 'utility'
}

export var requirement = {
    
}

export const trigger = (/^toanime$/i)