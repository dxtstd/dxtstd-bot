import * as os from "os";
import * as fs from "fs";
import * as sysinfo from "systeminformation"

interface IDeviceCPUUsage {
    user: number;
    nice: number;
    sys: number;
    idle: number;
    irq: number;
}

interface IDeviceMemory {
    status: string;
    free: number;
    available: number;
    total: number;
    usage: number;
    buffers: number;
    cached: number;
}

interface IDeviceInfo {
    platform: string;
    //machine: string;
    version: string;
    username: string;
    hostname: string;
    cpu: {
        model: string;
        core: number;
        usage: IDeviceCPUUsage[];
    };
    memory: {
        ram: Partial<IDeviceMemory>;
        swap: Partial<IDeviceMemory>;
        pagefiles: Partial<IDeviceMemory>;
    };
    network: {
        interfaces: string[];
        [key: string]: any;
    };
    node: {
        memory: any;
        cpu: any
    }
}

export function info(): IDeviceInfo {
    const cpus = os.cpus()
    const platform = os.platform()
    //const machine = os.machine()
    const hostname = os.hostname()
    const { username } = os.userInfo()
    const version = os.version()
    const networkInterfaces = os.networkInterfaces()
    
    const data: IDeviceInfo = {
        platform,
        //machine,
        version,
        username,
        hostname,
        cpu: {
            model: cpus[0].model,
            core: cpus.length,
            usage: []
        },
        memory: {
            ram: {
                status: "ready",
                free: NaN,
                available: NaN,
                usage: NaN,
                buffers: NaN,
                cached: NaN
                
            },
            swap: {
                status: "not found",
                free: NaN,
                usage: NaN,
                cached: NaN
            },
            pagefiles: {
                status: "not found",
                free: NaN,
                usage: NaN
            }
        },
        network: {
            interfaces: Object.keys(networkInterfaces),
            ...networkInterfaces
        },
        node: {
            memory: {},
            cpu: {}
        }
    }
    
    switch (platform) {
        case "android":
        case "linux": {
           const meminfo = {};
           fs.readFileSync("/proc/meminfo", { encoding: "utf-8" })
           .replace(/ kB/g, "")
           .replace(/ +/g, "")
           .split("\n")
           .forEach((v) => {
               const [key, value] = v.split(":");
               meminfo[key] = +((+value)/1000).toFixed()
           });
           
           const memory: Partial<{
               [key: string]: number
           }> = {}
           const swap: Partial<{
               [key: string]: number
           }>= {}
           
           Object.keys(meminfo).forEach(key => {
               if (key.startsWith("Mem")) {
                   memory[key.replace(/Mem/g, "").toLowerCase()] = meminfo[key]
               } else if (key.startsWith("Swap")) {
                   swap[key.replace(/Swap/g, "").toLowerCase()] = meminfo[key]
               }
           })
           
           data.memory.ram.total = memory.total
           data.memory.ram.free = memory.free
           data.memory.ram.available = memory.available
           data.memory.ram.usage = memory.total - memory.available
           data.memory.ram.buffers = meminfo["Buffers"]
           data.memory.ram.cached = meminfo["Cached"]
           
           if (swap?.total > 0) data.memory.swap.status = "ready"
           data.memory.swap.total = swap.total
           data.memory.swap.free = swap.free
           data.memory.swap.usage = swap.total - swap.free
           data.memory.swap.cached = swap.cached
           
           break;
        }
        default: {
            
        }
    }
    
    for(var i = 0, len = cpus.length; i < len; i++) {
        var cpu = cpus[i], total = 0;
        data.cpu.usage[i] = {} as IDeviceCPUUsage

        for(var type_cpu in cpu.times) {
            total += cpu.times[type_cpu];
        }

        for(var type_cpu in cpu.times) {
            data.cpu.usage[i][type_cpu] = Math.round(100 * cpu.times[type_cpu] / total)
        }
    }
    
    return data
}
