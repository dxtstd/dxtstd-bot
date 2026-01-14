import { Bot } from "../System/init"
import * as utils from "../Utils"

export async function callback(this: Bot, m): Promise<any> {
    return new Promise((resolve, reject) => {
        this.setTimeout(reject)
        
        utils.scrapper.lyricsfind.lyrics(m.text.body)
        .then((data) => {
            m.reply({
                image: { url: data.cover },
                caption: `[ LYRIC ]\nTitle: ${data.title}\n\n${data.lyrics}`
            }).then(resolve).catch(reject)
        })
        .catch(reject)
    })
}
export const trigger = (/^lyrics$/i)

export const metadata = {
    name: "lyrics",
    category: "utility",
    description: "this is lyrics"
}

export const requirement = {
    cash: 0,
    level: 0,
    premium: false,
    user: {
        admin: {
            bot: false,
            group: {
                super: false,
                normal: false
            }
        },
        owner: false,
        verified: true
    }
}

export const status = {
    beta: false,
    legacy: false,
    disable: false
}

export function help(type) {
    
}
