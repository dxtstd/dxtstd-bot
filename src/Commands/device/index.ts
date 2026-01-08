import { device } from '../../Utils'

export async function callback(bot, m, text): Promise<any> {
    return new Promise((resolve, reject) => {
        bot.setTimeout(reject)
        
        const DI = device.info()
        
        const usageCPU = []
        DI.cpu.usage.forEach((usage, i) => {
            let cucpu = "CPU " + i + ":"
            Object.keys(usage).forEach(type => {
                cucpu += "\n" + type + ": " + usage[type] + "%"
            })
            usageCPU.push(cucpu) 
        })
        
        const caption = "*[ DEVICE ]*" + "\n"
                      + "\n"
                      + "> Memory: " + "\n"
                      + ">> RAM: " + "\n"
                      + "free      : " + DI.memory.ram.free + "MB\n"
                      + "available : " + DI.memory.ram.available + "MB\n"
                      + "used      : " + DI.memory.ram.usage + "MB\n"
                      + "total     : " + DI.memory.ram.total + "MB\n"
                      + ">> Swap: " + "\n"
                      + "free      : " + DI.memory.swap.free + "MB\n"
                      + "used      : " + DI.memory.swap.usage + "MB\n"
                      + "total     : " + DI.memory.swap.total + "MB\n"
                      + "\n\n"
                      + "> CPU: " + "\n"
                      + ">> Model: " + DI.cpu.model + "\n"
                      + ">> Core: " + DI.cpu.core + "\n"
                      + ">> Usage: " + "\n"
                      + usageCPU.join("\n")
                      + "\n"
                      
        m.reply({ text: caption })
        .then(resolve)
        .catch(reject)
    })
}

export * as help from './help'

export const metadata = {
    name: "device",
    category: "utility"
}

export var requirement = {
    
}

export var status = {
    
}

export const trigger = (/^device$/i)
