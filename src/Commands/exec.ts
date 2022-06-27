import * as util from 'util'

import { execSync } from "child_process"

import { CommandType } from '../Types'

const command: CommandType = {} as CommandType
command.default = async (client, { data, database }, logger) => {
    try {
        const ExecResult = (await execSync(data.text.body)).toString().trim();
        client.sendMessage(data.from, { text: util.format(ExecResult) }, { quoted: data.chat })
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
command.name = 'exec'
command.help = ['exec'].map(v => v + ' ');
command.category = 'owner'
command.use = /^ex(ec)?$/;

//OPTION
command.disable = {
    active: false,
    reason: ''
}
command.beta = false;
command.support = {
    android: true,
    linux: true,
    windows: true
};

module.exports = command;
