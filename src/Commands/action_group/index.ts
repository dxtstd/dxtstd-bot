import { parsePhoneNumber } from 'awesome-phonenumber'

export async function callback(bot, m, text): Promise<any> {
    try {
        if (!(m.on.group)) return void 0;
        if (!(m.user.is.admin.normal || m.user.is.admin.super)) return void 0;
        
        const participants = []
        
        if (!!m.quoted?.key) {
            if (m.quoted?.key.participant == m.sender) {
                void 0;
            } else { participants.push(m.quoted.key.participant) }
        }
        
        for await (let phone of text.args) {
            if (phone.startsWith('@')) (phone = '+' + phone.replace(/@/g, ''));
            
            if (!phone.startsWith('+')) continue;
            if (!(/^[0-9]{9,13}$/i).test(phone.replace(/\+/g, ''))) continue;
            if (!parsePhoneNumber(phone).toJSON().possible) continue;
            if (await bot.sock.onWhatsApp(phone.replace(/\+/g, '') + "@s.whatsapp.net").then((res) => {
                return !res[0]
            }).catch(error => { return true })) continue;
            
            participants.push(phone.replace(/\+/g, '') + "@s.whatsapp.net")
        }
        
        if (participants.length == 0) {
            return bot.sock.sendMessage(m.from, { text: `who do you want to ${text.command}?` }, { quoted: m })
        }
        
        switch (text.command) {
            case 'kick': {
                for await(const participant of participants) {
                    await bot.sock.groupParticipantsUpdate(m.from, [participant], 'remove')
                }
                break
            }
            case 'add':
            case 'invite': {
                await bot.sock.groupParticipantsUpdate(m.from, participants, 'add')
                break
            }
            
            case 'promote': {
                await bot.sock.groupParticipantsUpdate(m.from, participants, 'promote')
                break
            }
            case 'demote': {
                await bot.sock.groupParticipantsUpdate(m.from, participants, 'demote')
                break
            }
        }
        
        const result = bot.sock.sendMessage(m.from, {
            text: `execute ${text.command} ${participants.map(v => {
                return '@' + v.split('@')[0]
            }).join(' ')}`
        }, { quoted: m })
        return result 
    } catch (error) {
        bot.logger.error(error)
    }
}

export * as help from './help'

export const metadata = {
    name: 'group action',
    category: 'configuration'
}

export var requirement = {
    
}

export const trigger = (/^add|kick|promote|demote$/i)