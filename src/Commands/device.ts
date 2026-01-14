import { device } from '../Utils'
import { Bot } from "../System/init"

function percentage(partialValue, totalValue) {
    return ((100 * partialValue) / totalValue).toFixed(1);
 } 

export async function callback(this: Bot, m): Promise<any> {
    return new Promise((resolve, reject) => {
        this.setTimeout(reject)

        const DI = device.info()

        const caption = "*[ DEVICE ]*" + "\n"
        + "\n"
        + "> Memory: " + "\n"
        + ">> RAM: " + `${DI.memory.ram.usage}/${DI.memory.ram.total}MB (${percentage(DI.memory.ram.usage, DI.memory.ram.total)}%)` + "\n"
        + ">> Swap: " + `${DI.memory.swap.usage}/${DI.memory.swap.total}MB (${percentage(DI.memory.swap.usage, DI.memory.swap.total)}%)` + "\n"
        + "\n\n"
        + "> CPU: " + "\n"
        + ">> Model: " + DI.cpu.model + "\n"
        + ">> Core: " + DI.cpu.core + "\n"
        
        m.reply({ text: caption })
        .then(resolve)
        .catch(reject)
    })
}
export const trigger = (/^device$/i)

export const metadata = {
    name: "device",
    category: "utility",
    description: "this is test!"
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
