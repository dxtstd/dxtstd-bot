import * as types from "../../Types"
import { Bot } from "../init"

import logger_default from "../../Utils/logger"
const logger = logger_default.child({ class: "dxtstd-bot", system: "handler.message.bot.listener" })

import * as util from "util"
import moment from "moment-timezone"

export async function listener(this: Bot, m: types.message) {
    const mybot = this

    logger.info({
        name: "msg",
        information: {
            sender: m.sender,
            from: m.from,
            username: m.name.user,
            groupname: m.name.group,
            message: {
                time: moment((m.messageTimestamp as number)*1000).tz(this.config.bot.timezone).format("ddd DD-MMM-YYYY, hh:mm A"),
                type: m.type,
                text: m.text.full
            }
        }
    }, "Received message...")
    
    
    if (m.text.command) {
        const command = mybot.command.get(m.text.command)
        if (!command) return;
        if (m.user.status.banned) return;
        
        let message_not_running_command = ""
        if (command.requirement.user.verified && !m.user.status.verified) {
            message_not_running_command = "you are not verified yet, pls for run command *%prefix%verify*".replace("%prefix%", m.text.prefix)
        } else if (command.requirement.user.owner && !mybot.checkIsOwner(m.user.id).status && !m.key.fromMe) {
            message_not_running_command = "you are not owner for this bot..."
        } else if (command.requirement.user.admin.bot && !(mybot.checkIsAdminBot(m.user.id)).status && !m.key.fromMe) {
            message_not_running_command = "you are not admin on this bot..."
        } else if (command.requirement.user.admin.group.normal && !(await mybot.checkIsAdmin(m.from, m.user.id)).status) {
            message_not_running_command = "you are not admin on this group..."
        } else if (command.requirement.user.admin.group.super && !(await mybot.checkIsAdmin(m.from, m.user.id)).super) {
            message_not_running_command = "you are not creator of this grup..."
        }

        if (command.requirement.premium && !m.user.status.premium.active) {
            message_not_running_command = "you will need premium to use this command..."
        } else if (command.requirement.level > m.user.level) {
            message_not_running_command = "oh no, your level is not yet enough to use this command..."
        } else if (command.requirement.cash > m.user.cash) {
            message_not_running_command = "lets go to work for having a money, your money is not enough..."
        }

        if (message_not_running_command.length > 0) {
            return m.reply({ text: message_not_running_command })
        }

        const start_time = Date.now()
        command.callback.bind(mybot)(m)
        .then((res) => {
            logger.debug({
                time: Date.now() - start_time,
                command: command.name,
                output: util.format(res),
                error: null
            }, "Finish running command...")
        })
        .catch((e) => {
            logger.error({
                time: Date.now() - start_time,
                command: command.name,
                output: null,
                error: util.format(e)
            }, "Error when running command...")
            m.reply({ text: util.format(e) })
        })
    }
}