import * as fs from 'fs'
import * as path from 'path'

export async function callback(bot, m, text): Promise<any> {
    new Promise((resolve, reject) => {
        bot.setTimeout(reject)
        
        const send = (url) => {
            m.reply({
                image: {
                    url
                },
                caption: fs.readFileSync(path.join(__dirname, './profile.txt'), { encoding: 'utf-8'}) 
            })
            .then(resolve)
            .catch(reject)
        }
        
        bot.sock.profilePictureUrl(
            (bot.database.config.owner.phone + '@s.whatsapp.net'),
            'image'
        )
        .then(send)
        .catch(error => send(path.join(__dirname, '../../../', 'assets/blank.png')))
    })
}

export * as help from './help'

export const metadata = {
    name: 'owner',
    category: undefined
}

export var requirement = {
    
}

export const trigger = (/^owner$/i)