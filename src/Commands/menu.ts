import * as util from 'util'
import * as fs from 'fs'
import * as path from 'path'

import { Commands } from '../System/command'
import { CommandType } from '../Types'

const MakeMenu = function () {
    return {
        header: `
*DXTSTD Bot*
Hi %user%!

*[ %TypeMenu% ]*
`.trimStart(),
        body: `%menu%
    
*<>* = _requirement_, *()* = _optional_
*|* = _or_, *&* = _and_
*@* = _tag_, *R* = _reply_

information for donation, type *%donate*`.trimStart(),
        footer: `%package%`
    } as any
}

const command: CommandType = {} as CommandType;
command.default = async (client, { data, database }, logger) => {
    try {
        const MENU = MakeMenu()
        const commands = new Commands()
        let MenuType: string = '';
        
        if (data.text.args.length == 0) MenuType = 'main';
        else if (data.text.args[0] == 'all') MenuType = 'all'
        else if (data.text.args.length > 0) MenuType = 'sub'
        
        
        MENU.header = MENU.header.replace('%user%', data.name.user)
        MENU.header = MENU.header.replace('%TypeMenu%', `${MenuType} menu`.toUpperCase())
        
        if (MenuType == 'main') {
            let ContentsMenu: string = ''
            Object.keys(commands.category).forEach(v => {
                
                ContentsMenu += '> ' + (database.config.prefix || '%') + 'menu ' + v + '\n'
            })
            ContentsMenu = ContentsMenu.trimEnd()
            MENU.body = MENU.body.replace('%menu%', ContentsMenu)
        }
        
        if (MenuType == 'all') {
            
        }
        
        if (MenuType == 'sub') {
            let ContentsMenu: string = ''
            let SubMenu = commands.category[data.text.args[0]]
            if (!SubMenu) {
                client.sendMessage(data.from, { text: `Submenu "${data.text.args[0]}" not available in main menu` }, { quoted: data.chat })
                return
            }
            MENU.header += '*Category:* ' + (data.text.args[0]).toUpperCase() + '\n'
            
            Object.keys(SubMenu).forEach(cmd => {
                SubMenu[cmd].help.forEach(help => {
                    ContentsMenu += '> ' + (database.config.prefix) + help + '\n'
                })
            })
            
            ContentsMenu = ContentsMenu.trimEnd()
            MENU.body = MENU.body.replace('%menu%', ContentsMenu)
        }
        
        const PackageJSON = JSON.parse(String(fs.readFileSync(path.resolve(__dirname, '../../package.json'))))
        MENU.footer = MENU.footer.replace('%package%', (PackageJSON.name+'@^'+PackageJSON.version))
        
        const TemplateMenu = {
            text: (MENU.header + MENU.body),
            footer: MENU.footer,
            templateButtons: []
        }
        client.sendMessage(data.from, TemplateMenu, { quoted: data.chat })
        
    } catch (e) {
        logger.error(e)
        client.sendMessage(data.from, {
            text: util.format(e)
        }, {
            quoted: data.chat
        })
    }
}

//PERMISSION
command.permission = {
    owner: false,
    admin: {
        bot: false,
        normal: false,
        super: false
    },
    premium: false,
    group: false,
    private: false
};
//NEED
command.need = {
    register: false,
    limit: {
        amount: 0
    },
    cash: {
        amount: 0
    },
    level: 0
};
//INFO
command.name = 'menu'
command.help = [].map(v => v + ' ');
command.category = ''
command.use = /^menu$/i;

//OPTION
command.disable = {
    active: false,
    reason: ''
};
command.beta = false;
command.support = {
    android: true,
    linux: true,
    windows: true
};

module.exports = command;
