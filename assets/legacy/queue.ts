
export interface IPDBQueue extends PouchDB.Database {
    makeQueue: () => void;
    queue: {
        list: any[];
        running: boolean;
        event: any;
        add: (fungsi: () => Promise<any>, args: any[]) => void;
        add_and_wait: (fungsi: () => Promise<any>, args: any[]) => Promise<any>;
        run: () => void
    }
}

export const makeQueue = function (this: IPDBQueue) {
    var db = this

    const queue = {
        list: [],
        running: false,
        event: new Events.build(),
        add: function (fungsi, ...args) {
            this.list.push([fungsi, args])
            logger.debug({
                tasks: this.list
            }, "add queue")
            if (!this.running) this.run()
        },
        add_and_wait: async function (fungsi, ...args) {
            const hash = createHash(32)
            this.list.push([fungsi, args, hash])

            logger.debug({
                tasks: this.list
            }, "add queue and wait")
        
            return new Promise((resolve, reject) => {
                if (!this.running) this.run()
                this.event.on("done", (res) => {
                    if (res.hash == hash) resolve(res.data)
                    //else reject(new Error(util.format({ data: res, hash })))
                })
            })
        },
        run: async function () {
            if (this.running) return void 0;
            if (!this.list.length) return
            let hash = ""
            if (!!this.list[0] && !!this.list[0][2]!!) hash = this.list[0][2]
            logger.debug({
                running_task: [util.format(this.list[0])]
            }, "running queue")

            this.running = true
        
            const timeout = setTimeout(() => {
                if (!!this.list[0] && !!this.list[0][2]) {
                    logger.debug("timeout run queue and emit hash...")
                    this.event.emit("done", { data: null, hash: hash })
                }
                this.running = false
                this.list.shift()
                this.run()
            }, 10000)
        

            const finishhandler = (data?) => {
                //console.log(data, hash)
                clearTimeout(timeout)
                logger.debug("finish run queue...")
                if (!!this.list[0] && !!this.list[0][2]) {
                    logger.debug("finish run queue and emit hash...")
                    this.event.emit("done", { data, hash })
                }
                this.running = false
                this.list.shift()
                this.run()
            }
            const tadi = Date.now()
            this.list[0][0](...this.list[0][1])
            .then((data) => {
                if (data) (console.log("perasaan bisa dah", data),console.log((Date.now() - tadi) + "ms"))
                finishhandler(data)
            })
            .catch((data) => {
                if (data) (console.log("perasaan bisa dah", data),console.log((Date.now() - tadi) + "ms"))
                finishhandler(data)
            })
        }
    }

    this.queue = queue
}
