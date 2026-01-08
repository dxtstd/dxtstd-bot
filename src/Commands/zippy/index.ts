import { scrapper } from '../../Utils'

export async function callback(bot, m, text): Promise<any> {
    return new Promise((resolve, reject) => {
        bot.setTimeout(reject)
        
        scrapper.zippy(m.text.args[0]).then(metadata => {
            if ((+metadata.file.size / 1000) > 1000) resolve(void 0);
            
            m.reply({ text: "wait..." }).catch(reject)
            
            m.reply({
                document: { url: metadata.file.url },
                fileName: metadata.file.name,
                mimetype: metadata.file.mimetype
            }).catch(reject).then(resolve)
        }).catch(reject)
    })
}

export * as help from './help'

export const metadata = {
    name: 'zippy',
    category: 'downloader'
}

export var requirement = {
    
}

export const trigger = (/^zippydl$/i)