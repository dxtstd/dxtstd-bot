const util = require('util')

let command = async (data) => {
    let result
    try {
        let mesej = data.chat.message.quoted()
        if (!mesej.key) return result = "Reply pesan nya!"
        if (!mesej.key.fromMe) return result = "Pesan bukan dari bot!"
        await client.sendMessage(data.from, { delete: mesej.key })
        result = "Berhasil menghapus pesan!"
    } catch (e) {
        result = e
    } finally {
        client.sendMessage(data.from, { text: util.format(result) }, { quoted: data.chat })
    }
    
}


//PERMISSION
command.permission = {
    owner: false,
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
command.name = 'Delete'
command.help = ['delete'].map(v => v + " *<[R:message]>*")
command.tags = ['utility']
command.use = (/^d(el?ete)?$/i)

//OPTION
command.disable = false
command.beta = false
command.support = {
    android: true,
    linux: true,
    windows: true
}

module.exports = command
