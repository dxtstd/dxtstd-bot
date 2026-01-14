import * as defaults from "../Defaults"
import * as fs from "fs";
import * as path from "path";

import { Bot } from "./init"

const DEFAULT_PATH_BOT = path.resolve(process.cwd())
const CONFIG_PATHFILE = path.resolve(DEFAULT_PATH_BOT, "config.json")

export const configuration = async function (this: Bot): Promise<void> {
    const mybot = this
    const config = defaults.config
    const readConfig = async function (id) {
        
        const { value } = await mybot.database.read("config", id)
        return value ?? null
    }

    const writeConfig = async function (id, value) {
        return mybot.database.write("config", id, {
            value
        })
    }

    if ((await readConfig("active"))) {
        for (var v of Object.keys(config)) {
            config[v] = await readConfig(v)
        }
    }

    if (this.config.init.database == "main") {
        const config_json = JSON.parse(fs.readFileSync(CONFIG_PATHFILE, { encoding: "utf-8" }))
        for (var v of Object.keys(config_json)) {
            config[v] = config_json[v]
        }
    }

    for (var v of Object.keys(config)) {
        await writeConfig(v, config[v])
    }

    this.config.bot = config
}