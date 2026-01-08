import * as defaults from '../../../Defaults'

const TEXT = {
    header: `*[ ANTI %choice% ]*`,
    body: `%info%`,
    footer: `_you have violated, as a punishment you will be kicked from this group, sorry..._`
}

const regexLink = /^(https?:\/\/)?chat\.whatsapp\.com\/(?:invite\/)?([a-zA-Z0-9_-]{22})$/gi

export async function handler(bot, m): Promise<void> {
    if (!m.on.group) return void 0;
    if (!bot.isAdmin(m.from)) return void 0;

    bot.database.load()
    
    const group = bot.database.groups[m.from] || defaults.group
    if (!group?.config?.anti.link) return void 0;
    
    const links = (m.text.full.replace(/\n/gi, ' ').split(/ +/g).filter(v => { return v.replace(/[\@\#\$\_\&\-\+\(\)\*\"\'\;\!\?\~\`\|\•\√\π\÷\×\¶\∆\£\¢\€\¥\^\°\=\{\}\\\%\©\®\™\✓\[\]\<\>]/g, '').match(regexLink) }) || [])
    
    //console.log(links)
    if (links.length == 0) return void 0;
    const thisLinkGroup = await bot.sock.groupInviteCode(m.from)
    const result = links.map(link => {
        if ((regexLink.exec(link)||[])[2] == thisLinkGroup) return false
        else return true
    }).filter(v => { return v })[0] || false
    
    if (result) {
        let text = TEXT.header + '\n\n' + TEXT.body + '\n\n' + TEXT.footer
        const information = `Link Group: not the group link here`
        text = text.replace('%choice%', 'LINK').replace('%info%', information)
            
        if (m.user.is.admin.super||m.user.is.admin.normal) return void 0;
        if ((group.participants ? (!!(group.participants.filter(({ id }) => {
                return (id == m.sender)
        })[0])) : false)) {
            await bot.sock.groupParticipantsUpdate(m.from, [m.sender], "remove").then(async () => {
                await bot.sock.sendMessage(m.from, {
                    delete: m.key
                })
                await bot.sock.sendMessage(
                    m.from, { text }, {  }
                )
                return void 0
            })
            
        } else {
            await bot.sock.sendMessage(m.from, {
                delete: m.key
            })
        }
    }
}
