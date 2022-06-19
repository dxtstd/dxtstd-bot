const util = require('util');
let cp = require('child_process');
let {
    promisify
} = require('util');
let exec = promisify(cp.exec).bind(cp);


let command = async (data) => {
    try {
        const exec = cp.exec(data.args.join(' '), {
            stdio: [process.stdin, "pipe", "pipe"],
            shell: true
        })
        exec.stdout.on('data', (stdout) => {
            client.sendMessage(data.from, { text: util.format(stdout.toString()) }, { quoted: data.chat })
        })
        exec.stderr.on('data', (stderr) => {
            client.sendMessage(data.from, { text: util.format(stderr.toString()) }, { quoted: data.chat })
        })
    } catch (e) {
        client.sendMessage(data.from, { text: util.format(e) }, { quoted: data.chat })
    }
};

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
command.name = 'exec';
command.help = ['exec']
command.tags = ['owner'];
command.use = (/^ex(ec)?$/);

//OPTION
command.disable = false;
command.beta = false;
command.support = {
    android: true,
    linux: true,
    windows: true
}

module.exports = command;