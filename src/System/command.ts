import * as fs from "fs";
import * as fsp from "fs/promises";
import * as path from "path";
import * as util from "util";

import logger_default from "../Utils/logger";

const logger = logger_default.child({ class: "dxtstd-bot", system: "commands" })

const DEFAULT_PATH_SRC = path.resolve(__dirname, "..")
const DEFAULT_PATH_CMDS = path.join(DEFAULT_PATH_SRC, "Commands")

export class Commands {
    private static DEFAULT_PATH_CMDS = path.join(DEFAULT_PATH_SRC, "Commands")
    public list: {commands: any, files: string[]} = {files: [], commands: { category: {}, uncategory: []}}
    public log = []

    public get: (syntax) => any|undefined
    public async load(): Promise<void> {
        const tasks = []
        const files = this.list.files = fs.readdirSync(DEFAULT_PATH_CMDS).map((file => path.resolve(DEFAULT_PATH_CMDS, file))).filter(file => (file.endsWith(".ts")||file.endsWith(".js")))
        for (var file of files) {
            const startTime = Date.now()
            tasks.push(
                new Promise((resolve, reject) => {
                    import(file)
                    .then((command) => {
                        if (!this.list.commands.category[command.metadata.category]) this.list.commands.category[command.metadata.category] = [];
                        if (!!command.metadata.category) {
                            this.list.commands.category[command.metadata.category].push(command);
                        } else {
                            this.list.commands.uncategory.push(command)
                        }

                        const msg = {
                            time: (Date.now() - startTime).toString() + ("ms"),
                            message: "Success load command \"%file%\"".replace("%file%", file), 
                            error: null 
                        }
                        logger.debug(msg)
                        resolve(msg)
                    })
                    .catch((e) => {
                        const msg = { 
                            time: (Date.now() - startTime).toString() + ("ms"),
                            message: "Failed load command \"%file%\"".replace("%file%", file), 
                            error: util.format(e)
                        }

                        logger.error(msg)
                        reject(msg)
                    })
                })
            )
        }

        const res = await Promise.all(tasks)
        this.log.push(res)
    }

    constructor() {
        this.get = function GetCommand(syntax): any|undefined {
            const list_command = []
            Object.keys(this.list.commands.category).forEach((category) => {
                this.list.commands.category[category].forEach((command) => {
                    list_command.push(command)
                })
            })
            this.list.commands.uncategory.forEach(command => {
                list_command.push(command)
            });
    
            return list_command.filter((command) => !!command.trigger.test(syntax))[0] ?? void null
        }
    }
}