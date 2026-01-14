import logger_default from "./logger"
const logger = logger_default.child({ class: "dxtstd-bot", system: "utils.promise-queue" })

export const promiseQueue = class PromiseQueue {
    public tasks: any[] = []
    public running = false
    public current_task = 0
    public total_task = 0

    constructor(tasks: any[]) {
        this.tasks = tasks
        this.total_task = tasks.length
    }

    handler(resolve, reject) {
        this.running = false
        this.tasks.shift()
        if (!this.tasks.length) (logger.debug({ tasks: this.tasks }, "completed running task"), resolve())
        else (logger.debug({ tasks: this.tasks }, `running other tasks ${this.current_task}/${this.total_task}`), this.run())
    }

    async run() {
        this.current_task++
        logger.debug("running...")
        return new Promise((resolve, reject) => {
            this.tasks[0]()
            .then(this.handler(resolve, reject))
            .catch(e => (logger.error(e), this.handler(resolve, reject)))
        })
    }
}