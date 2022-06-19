const fs = require('fs')
const util = require('util')

const command = async (data) => {
    try {
         let random = Math.floor((Math.random() * 5) + 1)
         let dice = fs.readFileSync(dir.assets + 'dice' + '/' + random + '.webp')
         
         client.sendMessage(data.from, { sticker: dice }, { quoted: data.chat })
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
command.name = 'Dice';
command.help = ['dice'].map(v => v + ' ');
command.tags = ['games'];
command.use = (/^dice$/i);

//OPTION
command.disable = false;
command.beta = false;
command.support = {
    android: true,
    linux: true,
    windows: true
};

module.exports = command;
