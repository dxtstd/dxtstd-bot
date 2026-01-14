import pino, { BaseLogger, Logger } from "pino";
import pretty from "pino-pretty";

export default<Logger> pino({
    level: "info"
}, pretty({
    colorize: true
}))