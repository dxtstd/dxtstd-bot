import * as util from 'util'
import { CommandType } from '../../Types'

import { Enable } from './enable'
import { Disable } from './disable'

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
        switch (data.text.command) {
            case 'enable':
                await Enable(data.text.args, { client, data, database})
                break;
            case 'disable':
                await Disable(data.text.args, { client, data, database})
                break;
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
    owner: true,
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
command.name = 'config'
const TextHelp = ''
command.help = ['enable', 'disable'].map(v => v + ' ' + TextHelp);
command.category = 'config'
command.use = /^(enable)?(disable)?$/i;

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
