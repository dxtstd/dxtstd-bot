import { scrapper } from '../../Utils'

export async function callback(bot, m, text): Promise<any> {
    const Pinterest = (new scrapper.pinterest.Pinterest())
    
    return new Promise((resolve, reject) => {
        bot.setTimeout(reject)
        
        if (text.body.length <= 0) {
            m.reply({
                text: "where the keyword?"
            })
            .then(resolve)
            .catch(reject)
            return
        }
        
        Pinterest.search.keyword(text.body)
        .then(pins => {
            if (pins.result.length <= 0) {
                m.reply({
                    text: "result not found!"
                })
                .then(resolve)
                .catch(reject)
            } else return pins.result[
                Math.floor(Math.random() * pins.result.length)
            ]
        })
        .then(pin => {
            const caption = (
                (
                '[ PINTEREST ]' + '\n' + '\n' +
                'title: %title%' + '\n' +
                'description: %desc%'
                ).replace('%title%', pin.title)
                .replace('%desc%', pin.description)
            )
            
            m.reply({ image: { url: pin.link.image }, caption })
            .then(resolve)
            .catch(reject)
        })
        .catch(reject)
    })
}

export * as help from './help'

export const metadata = {
    name: 'pinterest',
    category: 'downloader'
}

export var requirement = {
    
}

export const trigger = (/^pinterest$/i)