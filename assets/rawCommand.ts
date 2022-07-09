import * as util from 'util'
import { CommandType } from '../Types'

const help = ({data, database}) => {
    const pref = database.config.prefix
    const cmd = data.text.command
    return `
${pref}${cmd}
${pref}${cmd}
`.trimStart().trimEnd()
}

const command: CommandType = {} as CommandType;
command.default = async (client, { data, database }, logger) => {
    try {
        
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
command.name = ''
command.help = [].map(v => v + ' ');
command.category = ''
command.use = /^$/i;

//OPTION
command.disable = {
    active: false,
    reason: ''
};command.beta = false;
command.support = {
    android: true,
    linux: true,
    windows: true
};

module.exports = command;
