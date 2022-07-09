import { Commands } from '../command'
import { logger } from '../../Utils'
import { SimpleAdmin } from '../Simpler'

import * as util from 'util'


export async function CommandHandler (this: any, client, {
    data, database
}): Promise<void> {
    try {
        const commands = new Commands()
        let command
        Object.keys(commands.uncategory).forEach(cmd => {
            if (commands.uncategory[cmd].use.test(data.text.command)) {
                command = commands.uncategory[cmd]
            }
        })

        Object.keys(commands.category).forEach(type => {
            Object.keys(commands.category[type]).forEach(cmd => {
                if (commands.category[type][cmd].use.test(data.text.command)) {
                    command = commands.category[type][cmd]
                }
            })
        })

        const {
            user,
            group
        } = data

        const bot: {
            id: string, name: string, admin: any
        } = {
            ...client.user,
            admin: SimpleAdmin(user.id, group.id, database)
        }

        if (!command) {
            const text = `Command *${data.text.command}* not found.`
            client.sendMessage(data.from, {
                text: text
            }, { quoted: data.chat })
            return
        }

        if (command.permission.owner && !user.is.owner) {
            const text = 'You are not the owner!'
            client.sendMessage(data.from, {
                text: text
            }, { quoted: data.chat })
            return
        }
        
        if (command.permission.admin.normal && !user.is.admin.normal) {
            const text = 'You are not admin on this group!'
            client.sendMessage(data.from, {
                text: text
            }, { quoted: data.chat })
            return
        }
        
        if (command.permission.admin.super && !user.is.admin.super) {
            const text = 'You are not super admin on this group!'
            client.sendMessage(data.from, {
                text: text
            }, { quoted: data.chat })
            return
        }
        
        if (command.permission.admin.bot && !bot.admin.normal) {
            const text = 'Bot are not admin on this group!'
            client.sendMessage(data.from, {
                text: text
            }, { quoted: data.chat })
            return
        }

        try {
            command.default.call(this, client, { data, database }, logger)
        } catch (error) {
            client.sendMessage(data.from, {
                text: util.format(error)
            }, { quoted: data.chat })
            logger.error(error)
        }
    } catch (error) {
        client.sendMessage(data.from, {
            text: util.format(error)
        }, { quoted: data.chat })
        logger.error(error)
    }
}