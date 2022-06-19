const util = require('util')

let command = async (data) => {
    let evalu
    try {
        evalu = await eval(data.args.join(" "))
    } catch (e) {
        evalu = e
    }

    client.sendMessage(data.from, {
        text: util.format(evalu)
    }, {
        quoted: data.chat
    })
}


//PERMISSION
command.permission = {
    owner: true,
    admin: {
        normal: false,
        super: false
    },
    premium: false,
    group: false
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
command.name = 'eval'
command.help = ['eval']
command.tags = ['owner']
command.use = (/^ev(al)?$/)

//OPTION
command.disable = false
command.beta = false
command.support = {
    android: true,
    linux: true,
    windows: true
}

module.exports = command
