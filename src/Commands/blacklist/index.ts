import { parsePhoneNumber, getRegionCodeForCountryCode, getCountryCodeForRegionCode } from 'awesome-phonenumber'

export async function callback(bot, m, text): Promise<any> {
    try {
        const action = text.args[0]
        text.args = text.args.splice(1)
        
        switch (action) {
            case 'list': {
                const caption = `[ List Blacklist on this group ]` + '\n'
                           + `\n`
                           + `Participant: ${m.group.config?.blacklist.participant.map(v => {
                                return '@' + v.split('@')[0]
                            }).map(v => {
                                return '*' + v + '*'
                            }).join(', ') || 'None'}` + `\n`
                           + `Country: ${m.group.config?.blacklist.country.map(v => {
                                return '+' + getCountryCodeForRegionCode(v) + ' ' + `(${v})`
                            }).map(v => {
                                return '*' + v + '*'
                            }).join(', ') || 'None'}`
                            
                bot.sock.sendMessage(m.from, { text: caption, mentions: m.group.config?.blacklist.participant }, { quoted: m })
                break 
            }
            
            case 'country': {
                if (!(m.on.group)) return void 0;
                if (!(m.user.is.admin.normal || m.user.is.admin.super)) return void 0;

                const list_blacklist = text.args.map(regionCode => {
                    const countryCode = getRegionCodeForCountryCode(regionCode.replace('+', ''))
                    
                    if (!!(((bot.database.groups[m.from]).config?.blacklist.country || []).filter(bl_participant => {
                        return bl_participant == countryCode
                    })[0])) return void 0;
                    
                    //console.log((countryCode == 'ZZ' ? void 0 : countryCode))
                    return (countryCode == 'ZZ' ? void 0 : countryCode)
                }).filter(bl => !!bl)
                
                
                
                if (list_blacklist.length == 0) {
                    bot.sock.sendMessage(m.from, { text: `which country do you want add to blacklist?\nexample: *${bot.database.config.prefix}${text.command} ${action} +1*` })
                    return void 0;
                }
                
                const caption = `Add country ${list_blacklist.map(v => {
                    return '+' + getCountryCodeForRegionCode(v) + ' ' + `(${v})`
                }).map(v => {
                    return '*' + v + '*'
                }).join(', ')} to blacklist`
                
                bot.database.load()
                list_blacklist.forEach(v => {
                    bot.database.groups[m.from].config.blacklist.country.push(v)
                })
                bot.database.save()
                
                bot.sock.sendMessage(m.from, { text: caption }, { quoted: m })
                break
            }
            
            case 'add': {
                if (!(m.on.group)) return void 0;
                if (!(m.user.is.admin.normal || m.user.is.admin.super)) return void 0;
                const list_blacklist = text.args.map(phone => {
                    phone = phone.replace('@', '').replace('+', ''.replace(/\-/, ''))
                    if (!!(((bot.database.groups[m.from]).config?.blacklist.participant || []).filter(bl_participant => {
                        return bl_participant == phone + "@s.whatsapp.net"
                    })[0])) return void 0;
                
                    return (
                        parsePhoneNumber('+' + phone.replace('@', '').replace('+', ''.replace(/\-/, ''))).toJSON().possible ? 
                        phone.replace('@', '').replace('+', ''.replace(/\-/, '')) + "@s.whatsapp.net" :
                        void 0
                    ) 
                }).filter(bl => !!bl)
                
                if (m.quoted) {
                    const phone = m.quoted?.sender.split("@")[0].replace('@', '').replace('+', ''.replace(/\-/, ''))
                    
                    if (!(((bot.database.groups[m.from]).config?.blacklist.participant || []).filter(bl_participant => {
                        return bl_participant == phone + "@s.whatsapp.net"
                    })[0])) {
                        parsePhoneNumber('+' + phone).toJSON().possible ? 
                        list_blacklist.push(phone + "@s.whatsapp.net") :
                        void 0
                    };
                }
                
                const caption = `Add phone number ${list_blacklist.map(v => {
                    return "@" + v.split('@')[0]
                }).map(v => {
                    return '*' + v + '*'
                }).join(', ')} to blacklist`
                
                if (list_blacklist.length == 0) {
                    bot.sock.sendMessage(m.from, { text: `which phone number do you want add to blacklist?\nexample: *${bot.database.config.prefix}${text.command} ${action} +6212345678910/@user*` })
                    return void 0
                }
                
                bot.database.load()
                list_blacklist.forEach(v => {
                    bot.database.groups[m.from].config.blacklist.participant.push(v)
                })
                bot.database.save()
                
                bot.sock.sendMessage(m.from, { text: caption, mentions: list_blacklist || [] }, { quoted: m })
                break
            }
            case 'remove': {
                if (!(m.on.group)) return void 0;
                if (!(m.user.is.admin.normal || m.user.is.admin.super)) return void 0;
                
                const list_bl_country = bot.database.groups[m.from].config?.blacklist.country.filter(v => {
                    return m.text.args.filter(regionCode => {
                        const countryCode = getRegionCodeForCountryCode(regionCode.replace('+', ''))
                        
                        if (v == countryCode) return true
                        else false
                    })[0]
                })
                
                const list_bl_participants = bot.database.groups[m.from].config?.blacklist.participant.filter(v => {
                    return m.text.args.filter(phone => {
                        phone = phone.replace('@', '').replace('+', ''.replace(/\-/, ''))
                        
                        return v == phone+"@s.whatsapp.net"
                    })[0]
                })
                
                bot.database.load()
                bot.database.groups[m.from].config.blacklist.country = bot.database.groups[m.from].config?.blacklist.country.filter(v => {
                    return !list_bl_country.filter(va => v == va)[0]
                })
                
                bot.database.groups[m.from].config.blacklist.participant = bot.database.groups[m.from].config?.blacklist.participant.filter(v => {
                    return !list_bl_participants.filter(va => v == va)[0]
                })
                bot.database.save()
                
                bot.sock.sendMessage(m.from, { text: "Successful delete..." }, { quoted: m })
            }
            
            default: {
                
            }
        }
    } catch (error) {
        bot.logger.error(error)
    }
}

export * as help from './help'

export const metadata = {
    name: 'blacklist',
    category: 'configuration'
}

export var requirement = {
    
}

export const trigger = (/^blacklist$/i)