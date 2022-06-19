const os = require('os');
const fs = require('fs');
const util = require('util')

const command = async (data) => {
    try {
        //GET DATA FROM /proc/memInfo
        const rawmemInfo = ((fs.readFileSync('/proc/meminfo').toString()).replace(/ kB/g, '')).replace(/ +/g, "").trimEnd();
        const memInfo = {};

        rawmemInfo.split('\n').forEach((v) => {
            arrayInfoMem = v.split(":");
            namaInfoMem = arrayInfoMem[0].toLowerCase();
            memInfo[namaInfoMem] = Math.floor(arrayInfoMem[1]);
        });
        
        let freeRAM = memInfo.memfree
        let totalRAM = memInfo.memtotal
        let availableRAM = memInfo.memavailable
        let usageRAM = totalRAM - freeRAM
        let bufferRAM = memInfo.buffers
        let cachedRAM = memInfo.cached

        let freeSWAP = memInfo.swapfree;
        let totalSWAP = memInfo.swaptotal;
        let usageSWAP = totalSWAP - freeSWAP;
        let cachedSWAP = memInfo.swapcached

        let MEMORY = `//
\t=> *RAM:*
\t\t==> *free:* ${Math.floor(freeRAM / 1024)} MiB (${Math.round(100 * freeRAM / totalRAM)}%)
\t\t==> *available* : ${Math.floor(availableRAM / 1024)} MiB (${Math.round(100 * availableRAM / totalRAM)}%)
\t\t==> *usage:* ${Math.floor(usageRAM / 1024)} MiB (${Math.round(100 * usageRAM / totalRAM)}%)
\t\t\t===> *buffers:* ${Math.floor(bufferRAM / 1024)} MiB
\t\t\t===> *cached:* ${Math.floor(cachedRAM / 1024)} MiB
\t\t==> *total:* ${Math.floor(totalRAM / 1024)} MiB

\t=> *SWAP:*
\t\t==> *free:* ${Math.floor(freeSWAP / 1024)} MiB (${Math.round(100 * freeSWAP / totalSWAP)}%)
\t\t==> *usage:* ${Math.floor(usageSWAP / 1024)} MiB (${Math.round(100 * usageSWAP / totalSWAP)}%)
\t\t\t===> *cached:* ${Math.floor(cachedSWAP / 1024)} MiB
\t\t==> *total:* ${Math.floor(totalSWAP / 1024)} MiB
`
        
        //GET DATA CPU USAGE
        var cpus = os.cpus();
        let nameCPU;
        let cpuUsage = "//";
        
        if (cpus != 0) nameCPU = cpus[0].model;
        for(var i = 0, len = cpus.length; i < len; i++) {
            let cpuCoreUsage = ""
            cpuCoreUsage += `*CPU ${i}:*`
            var cpu = cpus[i], total = 0;

            for(var type in cpu.times) {
                total += cpu.times[type];
            }

            for(type in cpu.times) {
                cpuCoreUsage += (`\n\t\t\t===> *${type}:* ${Math.round(100 * cpu.times[type] / total)}%`)
            }
            
            if (cpuCoreUsage) cpuUsage += (`\n\t\t==> ` + cpuCoreUsage)
        }
        
        //GET DATA NodeJS Usage
        const JsonNJSUsg = process.memoryUsage()
        
        let NJSUsg = `//`

        Object.keys(JsonNJSUsg).forEach((v) => {
            NJSUsg  += `\n\t=> *${v}:* ${Math.floor(JsonNJSUsg[v] / 1024 / 1024)} MiB`
        })
        
        const teks = (`
*DXTSTD-Bot*
[ STATUS ]

> *NodeJS Usage:*
${NJSUsg.trimStart().replace("//\n", "")}

> *CPU:*
    => *Name:* ${nameCPU}
    => *Status:*
${cpuUsage.trimStart().replace("//\n", "")}

> *Memory:*
${MEMORY.trimStart().replace("//\n", "")}`.trimStart()).trimEnd()

    client.sendMessage(data.from, { text: teks }, { quoted: data.chat })
    } catch (e) {
        logger.error
        client.sendMessage(data.from, {
            text: util.format(e)
        }, {
            quoted: data.chat
        })
    }
};

//PERMISSION
command.permission = {
    owner: false,
    admin: {
        bot: false,
        normal: false,
        super: false
    },
    premium: false,
    group: false,
    private: false
};
//NEED
command.need = {
    verified: true,
    limit: {
        amount: 0
    },
    cash: {
        amount: 0
    },
    level: 0
};
//INFO
command.name = 'status';
command.help = ['status'];
command.tags = ['utility'];
command.use = (/^status$/i);

//OPTION
command.disable = false;
command.beta = false;
command.support = {
    android: true,
    linux: true,
    windows: false 
}

module.exports = command;