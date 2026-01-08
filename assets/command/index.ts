export async function callback(bot, m, text): Promise<any> {
    return new Promise((resolve, reject) => {
        bot.setTimeout(reject)
        
        
    })
}

export * as help from './help'

export const metadata = {
    name: "",
    category: undefined
}

export var requirement = {
    
}

export var status = {
    
}

export const trigger = (/^$/i)
