//PUT YOUR MODULE IN HERE ↓↓↓
const util = require("util")

const handler = async () => {
    const data = global.db.data

    const chat = data.chat
    const from = data.from
    const text = data.text
    const command = data.command
    const args = data.args
    const groupname = data.groupname
    const username = data.username

    const reply = (teks) => {
        client.sendMessage(from, util.format(teks), MessageType.text, {
            quoted: chat
        })
    }



    try {
        menu = {}
        menus = ''

        const teeks = (menu, submenu, menus) => {
            let tesub = ''
            if (submenu) tesub = `_${submenu}_`
            teks = `*${botname}*`
            + `\n` + `*[ _${menu}_ ]* ${tesub}`
            + `\n` + menus
            return teks
        }

        for (let name in global.plugins) {
            plugin = global.plugins[name]
            if (menu[plugin.tag] === undefined && plugin.tag != undefined && plugin.tag != "") {
                menu[plugin.tag] = []
                for (i in plugin.command) {
                    menu[plugin.tag].push(plugin.command[i])
                }
            } else if (menu[plugin.tag] != undefined) {
                for (i in plugin.command) {
                    menu[plugin.tag].push(plugin.command[i])
                }
            }
        }
        if (args.length === 0) {
            for (i in Object.keys(menu)) {
                menus += `\n> _${prefix}menu ${Object.keys(menu)[i]}_`
            }
            reply(teeks('MAIN MENU', false, menus))
        } else if (args.length > 0) {
            tag = args[0].toLowerCase()

            if (menu[tag] == undefined) return reply(`Menu *${args.join(' ', '\n')}* tidak ada!`)
            for (i in menu[tag]) {
                menus += `\n> _${prefix}${menu[tag][i]}_`
            }
            reply(teeks('SUB MENU', args[0].toUpperCase(), menus))

        }
    } catch (e) {
        reply(`ERROR: ${util.format(e)}`)
        logger.error(e)
    }
}

handler.disable = false

handler.help = false
if (handler.help) {
    handler.title = ''
    handler.description = ''
    handler.usage = ''
}

handler.owner = false
handler.private = false
handler.admin = false
handler.group = false

handler.tag = ''
handler.command = [`menu`]

module.exports = handler