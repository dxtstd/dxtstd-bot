const util = require('util')

let text = `
*DXTSTD Bot*
donate me to eat :D

*PayPal:* %paypal_link%
*Saweria:* %saweria_link%
`.trimStart()

const command = async (data) => {
    try {
        text = (text.replace('%paypal_link%', config.owner.donate.paypal))
        text = (text.replace('%saweria_link%', config.owner.donate.saweria))
        
        client.sendMessage(data.from, { text: text }, { quoted: data.chat })
    } catch (e) {
        
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
command.name = 'Donate';
command.help = ['donate'];
command.tags = [''];
command.use = (/^donate$/i);

//OPTION
command.disable = false;
command.beta = false;
command.support = {
    android: true,
    linux: true,
    windows: true
}

module.exports = command;