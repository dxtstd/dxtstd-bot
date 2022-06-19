/* WARN FOR THIS COMMAND */
// IF BINERY SAM IS NOT FOUND, this plugins must be turned off
// If you wanna this, check 
let urlGithub = "https://github.com/s-macke/SAM"
// build your own SAM!!
// and change pathSAM to your SAM

//check folder ../assets for the SAM
//don't forget to add execute mode this SAM, or you got ERR: EACCES

const os = require('os')
let pathSAM = '/home/DentaCH/SAM/sam'

if (os.platform() == "linux") {
    if (os.arch() == "x64") {
        //pathSAM = dir.assets + 'SAM/amd64/sam'
    } else if (os.arch() == "arm64") {
        //pathSAM = dir.assets + 'SAM/arm64/sam'
    }
}

const cp = require('child_process')
const fs = require('fs')

const command = async (data) => {
    try {
        let tmpSAM = dir.tmp + new Date() + ".wav"
        const sam = cp.spawn(pathSAM, ['-wav', tmpSAM, data.args.join(" ")])

        let killTimeout = false
        let timeout = setTimeout(function () {
            sam.kill()
            killTimeout = true
        }, 5*1000)

        sam.on('exit', async () => {
            if (!killTimeout) { clearTimeout(timeout); return await client.sendMessage(data.from, { audio: await fs.readFileSync(tmpSAM), mimetype: 'audio/mpeg', ptt: true }, { quoted: data.chat }) }
            else { clearTimeout(timeout); return await client.sendMessage(data.from, { text: "Failed!" }, { quoted: data.chat }) }
            
            fs.unlinkSync(tmpSAM)
        });
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
command.name = 'SAM TTS';
command.help = ['sam'].map(v => v + " *<[...text]>*");
command.tags = ['audio'];
command.use = (/^sam$/i);

//OPTION
command.disable = false;
command.beta = false;
command.support = {
    android: false,
    linux: true,
    windows: false
}

module.exports = command;