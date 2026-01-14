import * as msg_sock from "./message-sock"
import * as msg_bot from "./message-bot"

export * as group from "./group"
export * as user from "./user"
export const message = {
    bot: msg_bot,
    sock: msg_sock
}