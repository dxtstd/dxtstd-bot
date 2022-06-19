const menu = {
    header: `
*DXTSTD Bot*
Hi %user%!

*[ %typeMenu% ]*
`.trimStart(),
    body: `%menu%`,
    footer: `
*<>* = _requirement_, *()* = _optional_
*|* = _or_, *&* = _and_
*@* = _tag_, *R* = _reply_

information for donation, type *%donate*
Owner bot: %nameOwner%
%package%
`.trimStart().trimEnd()
}

const command = async (data) => {
    const cmd = {}
    
    for (let name in global.plugins) {
        if (global.plugins[name].tags && global.plugins[name].tags != 0 && !cmd[global.plugins[name].tags[0]]) {
            cmd[global.plugins[name].tags[0]] = []
            global.plugins[name].help.forEach((v) => {
                cmd[global.plugins[name].tags[0]].push(v)
                cmd[global.plugins[name].tags[0]].sort()
            })
        } else if (global.plugins[name].tags && global.plugins[name].tags[0] != 0 && cmd[global.plugins[name].tags[0]]) {
            global.plugins[name].help.forEach((v) => {
                cmd[global.plugins[name].tags[0]].push(v)
                cmd[global.plugins[name].tags[0]].sort()
            })
        } else {}
    }
    
    
    let teksMenu = `${menu.header}${menu.body}\n\n${menu.footer}`
    teksMenu = teksMenu.replace('%user%', global.db.users[data.sender].profile.name.notify)
    teksMenu = teksMenu.replace('%nameOwner%', config.owner.profile.name)
    
    const package = require('../package.json')
    teksMenu = teksMenu.replace('%package%', `${package.name}@^${package.version}`)
    
    if (data.args[0] == undefined) {
        let teksCategory = ``
        
        Object.keys(cmd).sort().forEach((category) => {
            teksCategory += `> ${config.prefix}${data.command} ${category}\n`
        })
        
        
        teksMenu = teksMenu.replace('%typeMenu%', 'MAIN MENU')
        teksMenu = teksMenu.replace('%menu%', teksCategory)
    } else if (data.args[0] == "all") {
        let teksAll = ``
        Object.keys(cmd).sort().forEach((category) => {
            let tmpTeksAll = `> *${category.toUpperCase()}*\n`
            cmd[category].forEach((commands) => {
                tmpTeksAll += `=> ${config.prefix}${commands}\n`
            })
            teksAll += tmpTeksAll + "\n"
        })
        teksMenu = teksMenu.replace('%typeMenu%', 'ALL MENU')
        teksMenu = teksMenu.replace('%menu%', teksAll)
    } else if (data.args[0]) {
        if (cmd[data.args[0]]) {
            let teksCommands = ``
            
            cmd[data.args[0]].forEach((commands) => {
                teksCommands += `> ${config.prefix}${commands}\n`
            })
            
            teksMenu = teksMenu.replace('%typeMenu%', 'SUB MENU' + (" " + "(" + data.args[0].toUpperCase() + ")"))
            teksMenu = teksMenu.replace('%menu%', teksCommands)
        } else {
            teksMenu = `*"${data.args[0]}"* tidak ada dalam menu!`
        }
    } else {}
    client.sendMessage(data.from, { text: teksMenu }, { quoted: data.chat })
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
}
//NEED
command.need = {
    verified: true,
    limit: {
        amount: 0
    },
    cash: {
        amount: 0
    },
    level: 0
}
//INFO
command.name = 'Menu'
command.help = ['menu']
command.tags = ['']
command.use = (/^menu$/i)

//OPTION
command.disable = false
command.beta = false
command.support = {
    android: true,
    linux: true,
    windows: true
}

module.exports = command