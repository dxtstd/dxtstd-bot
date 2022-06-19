
const util = require('util')

const command = async (data) => {
    try {
         let answer = ['Yes', 'No', 'Nope', 'Maybe', 'Maybe yes', 'Of course', 'Of course, no', 'literally no', 'literally yes', "i don't know", 'Ask again']
         let random = Math.floor((Math.random() * answer.length))
         
         let teks = `
*Question:* ${data.args.join(" ")}
*Answer:* ${answer[random]}`.trimStart()
         client.sendMessage(data.from, { text: teks }, { quoted: data.chat })
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
command.name = 'ask';
command.help = ['ask'].map(v => v + ' *<question>*');
command.tags = ['games'];
command.use = (/^ask$/i);

//OPTION
command.disable = false;
command.beta = false;
command.support = {
    android: true,
    linux: true,
    windows: true
};

module.exports = command;
