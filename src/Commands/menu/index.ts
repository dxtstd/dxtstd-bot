import * as fs from 'fs'
import * as path from 'path'

const MakeMenu = function () {
    return {
        header: `
*DXTSTD Bot*
Hi %user%!

*[ %TypeMenu% ]*
`.trimStart(),
        body: `%menu%`,
        footer: `%package%`
    } as any
}


export async function callback(bot, m, text): Promise<any> {
    try {
        const MENU = MakeMenu()
        let MenuType: string = '';
        
        if (m.text.args.length == 0) MenuType = 'main';
        else if (m.text.args[0] == 'all') MenuType = 'all'
        else if (m.text.args.length > 0) MenuType = 'sub'
        
        
        MENU.header = MENU.header.replace('%user%', m.name.user)
        MENU.header = MENU.header.replace('%TypeMenu%', `${MenuType} menu`.toUpperCase())
        
        if (MenuType == 'main') {
            let ContentsMenu: string = ''
            Object.keys(bot.commands.category).forEach(v => {
                ContentsMenu += '> ' + (bot.database.config.prefix || '/') + 'menu ' + v + '\n'
            })
            ContentsMenu = ContentsMenu.trimEnd()
            MENU.body = MENU.body.replace('%menu%', ContentsMenu)
        }
        
        if (MenuType == 'all') {
            
        }
        
        if (MenuType == 'sub') {
            let ContentsMenu: string = ''
            let SubMenu = bot.commands.category[m.text.args[0]]
            if (!SubMenu) {
                return bot.sock.sendMessage(m.from, { text: `Submenu "${m.text.args[0]}" not available in main menu` }, { quoted: m })
            }
            MENU.header += '*Category:* ' + (m.text.args[0]).toUpperCase() + '\n'
            
            Object.keys(SubMenu).forEach(cmd => {
                ContentsMenu += '> ' + (bot.database.config.prefix) + cmd + '\n'
            })
            
            ContentsMenu = ContentsMenu.trimEnd()
            MENU.body = MENU.body.replace('%menu%', ContentsMenu)
        }
        
        const PackageJSON = JSON.parse(String(fs.readFileSync(path.resolve(__dirname, '../../../package.json'))))
        MENU.footer = MENU.footer.replace('%package%', (PackageJSON.name+'@^'+PackageJSON.version))
        
        const ButtonMenu = {
            text: (MENU.header + MENU.body),
            footer: MENU.footer,
            buttons: [{
                text: 'Owner',
                command: '/owner'
            }, {
                text: 'Donate',
                command: '/donate'
            }]
        }
        return await m.reply({ text: (MENU.header + MENU.body) })
    } catch (error) {
        bot.logger.error(error)
    }
}

export * as help from './help'

export const metadata = {
    name: "menu",
    category: undefined
}

export var requirement = {
    
}

export const trigger = (/^menu$/i)
