import * as util from 'util'
import { CommandType } from '../../Types'

const help = ({data, database}) => {
    const pref = database.config.prefix
    const cmd = data.text.command
    return `
${pref}${cmd} status *#for information bot*
${pref}${cmd} shutdown *#shutdown bot _(owner)_*
${pref}${cmd} restart *#restart bot _(owner)_*
`.trimStart().trimEnd()
}

const command: CommandType = {} as CommandType;
command.default = async (client, { data, database }, logger) => {
    try {
        switch (data.text.args[0]) {
            case 'status':
            case 'stat':
                
                break;
            case 'reboot':
            case 'restart':
                if (!data.user.is.owner) return
                await client.sendMessage(data.from, { text: 'Reboot...' }, { quoted: data.chat})
                process.send('restart')
                break;
            case 'shutdown':
                if (!data.user.is.owner) return
                await client.sendMessage(data.from, { text: 'Shutdown...' }, { quoted: data.chat})
                process.send('shutdown')
                break;
            default:
                client.sendMessage(data.from, { text: help({data, database}) }, { quoted: data.chat});
        }
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
command.name = 'bot'
command.help = ['bot'].map(v => v + ' ');
command.category = 'utility'
command.use = /^bot$/i;

//OPTION
command.disable = {
    active: false,
    reason: ''
};;
command.beta = false;
command.support = {
    android: true,
    linux: true,
    windows: true
};

module.exports = command;
