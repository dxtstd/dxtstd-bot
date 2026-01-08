const TEXT = `
you can support me with
saweria: %saweria%
paypal: %paypal%

your support is very valuable for me :3
`.trimStart().trimEnd()

export async function callback(bot, m, text): Promise<any> {
    try {
        const { owner } = bot.database.config
        const result = await bot.sock.sendMessage(
            m.from, { text: (TEXT.replace('%saweria%', owner.donate.saweria)).replace('%paypal%', owner.donate.paypal) }, { quoted: m }
        )
        return result 
    } catch (error) {
        bot.logger.error(error)
    }
}

export * as help from './help'

export const metadata = {
    name: "donate",
    category: undefined
}

export var requirement = {
    
}

export const status = {
    maintance: false,
    beta: false,
    disable: {
        active: false,
        reason: ""
    }
}

export const trigger = (/^donate$/i)