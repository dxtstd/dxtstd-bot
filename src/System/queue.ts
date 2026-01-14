import logger_default from "../Utils/logger"
const logger = logger_default.child({ class: "dxtstd-bot", system: "queue" })

import * as Events from "./Events"

function createHash(length) {
    var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var text = '';
  
    length = length || 6;
  
    for (var i = 0; i < length; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  
    return text;
  }

export class Queue {
    public list: { [type: string]: any[] } = {}
    public running: { [type: string]: boolean } = {}
    public event

    constructor() {
        this.event = new Events.build()
    }

    add(type, fungsi: any, ...args: any[]) {
        if (!this.list[type]) (this.list[type] = [], this.running[type] = false)
        this.list[type].push([fungsi, args])
        logger.debug({ type, tasks: this.list[type].length }, "add queue...")
        if (!this.running[type]) this.run(type)
    }

    async add_and_wait(type, fungsi: any, ...args: any[]) {
        if (!this.list[type]) (this.list[type] = [], this.running[type] = false)
        const hash = createHash(32)
        this.list[type].push([fungsi, args, hash])

        logger.debug({ type, tasks: this.list[type].length }, "add queue and wait...")
        
        return new Promise((resolve, reject) => {
            if (!this.running[type]) this.run(type)
            this.event.once(`done.${hash}`, (res) => {
                resolve(res.data)
            })
        })
    }

    async run(type) {
        if (this.running[type]) return void 0;
        if (!this.list[type].length) return
        let hash = ""
        if (!!this.list[type][0] && !!this.list[type][0][2]) hash = this.list[type][0][2]
        logger.debug({ type, tasks: this.list[type].length }, "running queue...")

        this.running[type] = true
        
        const timeout = setTimeout(() => {
            if (!!this.list[type][0] && !!this.list[type][0][2]) {
                logger.debug({ type, tasks: this.list[type].length }, "timeout run queue and emit hash...")
                this.event.emit(`$done.${hash}`, { data: null, hash: hash })
            }
            this.running[type] = false
            this.list[type].shift()
            this.run(type)
        }, 10000)
        

        const finishhandler = (data?) => {
            clearTimeout(timeout)
            if (!!this.list[type][0] && !!this.list[type][0][2]) {
                logger.debug({ type, tasks: this.list[type].length }, "finish run queue and emit hash...")
                this.event.emit(`done.${hash}`, { data, hash })
            }
            this.running[type] = false
            this.list[type].shift()
            this.run(type)
        }
        //const tadi = Date.now()
        this.list[type][0][0](...this.list[type][0][1])
        .then((data) => {
            finishhandler(data)
        })
        .catch((data) => {
            finishhandler(data)
        })
    }
}
