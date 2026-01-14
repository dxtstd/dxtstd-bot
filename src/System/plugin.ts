import * as fs from "fs";
import * as path from "path";
import logger_default from "../Utils/logger";
const logger = logger_default.child({ class: "dxtstd-bot", system: "plugins" })

const DEFAULT_PATH_SRC = path.resolve(__dirname, "..")
const DEFAULT_PATH_PLGS = path.join(DEFAULT_PATH_SRC, "Plugins")
