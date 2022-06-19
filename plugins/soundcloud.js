const CLIENT_ID = "zZeR6I5DM5NMAYEhk7J9vveMqZzpCIym";
const soundcloud = require('soundcloud-downloader').default;
const simple = require('../lib/simple.js')
const util = require('util');

const isUrl = function (url) {
     return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
}

const command = async (data) => {
    try {
        if (!isUrl(data.args[0])) return 
        soundcloud.download(data.args, CLIENT_ID).then(async (buff) => {
            let hasil = await simple.pengbuffer(buff)
            client.sendMessage(data.from, { audio: hasil, mimetype: "audio/mpeg" }, { quoted: data.chat })
        })
    } catch (e) {
        logger.error(e)
        client.sendMessage(data.from, {
            text: util.format(e)
        }, {
            quoted: data.chat
        })
    }
};

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
    verified: true,
    limit: {
        amount: 0
    },
    cash: {
        amount: 0
    },
    level: 0
};

//INFO
command.name = 'soundcloud';
command.help = ['soundcloud'].map(v => v + " *<link>*");
command.tags = ['downloader'];
command.use = (/^soundcloud$/i);

//OPTION
command.disable = false;
command.beta = false;
command.support = {
    android: true,
    linux: true,
    windows: true
}

module.exports = command;