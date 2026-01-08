import * as utils from "../../Utils"

export async function callback(bot, m, text): Promise<any> {
    return new Promise((resolve, reject) => {
        bot.setTimeout(reject, 360*1000)
        if (!m.text.args[0]) 
            return m.reply({ text: "no url?" })
            .then(resolve)
            .catch(reject);
        
        utils.tweet(m.text.args[0])
        .then(image => {
            m.reply({
                image
            })
            .then(resolve)
            .catch(reject)
        })
        .catch(reject);
    })
}

export * as help from './help'

export const metadata = {
    name: "tweet",
    description: "",
    category: undefined
}

export var requirement = {
    
}

export var status = {
    
}

export const trigger = (/^tweet$/i)
