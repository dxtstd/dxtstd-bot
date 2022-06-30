import * as util from 'util'
import { CommandType } from '../Types'

import { ytdl } from '../Utils'

const help = ({data, database}) => {
    const pref = database.config.prefix
    const cmd = data.text.command
    return `
${pref}${cmd}
${pref}${cmd}
`.trimStart().trimEnd()
}

const command: CommandType = {} as CommandType;
command.default = async (
    client, { data, database }, logger
) => {
    try {
        const { args } = data.text
        switch (args[0]) {
            case 'mp3':
                const audio = await ytdl.mp3(args[1])
                client.sendMessage(data.from, { audio: audio, mimetype: 'audio/mpeg' }, { quoted: data.chat })
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
command.name = 'ytdl'
command.help = ['youtubedl'].map(v => v + ' <link>');
command.category = 'downloader'
command.use = /^(yt|youtube)(dl)$/i;

//OPTION
command.disable = {
    active: false,
    reason: ''
};command.beta = false;
command.support = {
    android: true,
    linux: true,
    windows: false
};

module.exports = command;
