import { scrapper } from '../../Utils'

export async function callback(bot, m, text): Promise<any> {
    return new Promise((resolve, reject) => {
        bot.setTimeout(reject)
        
        const keyword = m.text.body;
     

        scrapper.pixiv.search(keyword)
        .then(res => scrapper.pixiv.illustration(res.data[Math.floor(Math.random() * res.data.length)].id))
        .then(res => {
            const caption = `
*[ dxtstd-bot ]*
PIXIV

Title: ${res.title}
Description: ${res.description}
Viewers: ${res.viewers}
Likes: ${res.like}
Tags: ${res.tags.map(v => "#"+v).join(", ")}

source: https://www.pixiv.net/en/artworks/${res.id}
    `.trim()
            scrapper.pixiv.download(res.id)
            .then(buf => m.reply({ image: buf, caption }))
            .then(resolve)
            return void res
        })
    })
}

export * as help from './help'

export const metadata = {
    name: "pixiv",
    category: "downloader"
}

export var requirement = {
    
}

export var status = {
    
}

export const trigger = (/^pixiv$/i)
