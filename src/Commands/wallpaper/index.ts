import { scrapper } from '../../Utils'

function executor (wallpapers) {
    
}

export async function callback(bot, m, text): Promise<any> {
    return new Promise((resolve, reject) => {
        bot.setTimeout(reject)
        
        if (text.body.length < 0) resolve(void 0)
        scrapper.wallpaper(text.body)
        .then(wallpapers => {
            if (wallpapers.result.length < 1) resolve(void 0);
            const wallpaper = wallpapers.result[Math.floor(Math.random() * wallpapers.result.length)]
            
            const caption = ((
                '[ WALLPAPER ]' + '\n' + '\n' +
                'title: %title%'
            ).replace('%title%', wallpaper.title)
        )
            
            bot.sendButton(m.from, {
                media: {
                    image: { url: wallpaper.link.image }
                },
                text: caption,
                templateButtons: [{
                    text: 'Origin Post',
                    url: wallpaper.link.post,
                    type: 'url'
                },{
                    text: 'Next Image',
                    command: '/wallpaper %keyword%'.replace('%keyword%', text.body)
                }]
            }).then(resolve).catch(reject)
        })
        .catch(reject)
        
        
    })
}

export * as help from './help'

export const metadata = {
    name: 'wallpaper',
    category: 'downloader'
}

export var requirement = {
    
}

export const trigger = (/^wallpaper$/i)