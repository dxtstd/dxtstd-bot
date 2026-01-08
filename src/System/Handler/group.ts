import { parsePhoneNumber } from 'awesome-phonenumber'
import * as moment from 'moment-timezone'

import * as types from '../../Types'
import * as defaults from '../../Defaults'
import * as utils from "../../Utils"

export async function updateData(
    bot, id
): Promise<void> {
    try {
        if (!id.endsWith('@g.us')) return;
        bot.database.load();
        
        const fetchMetadata = async function () {
            const MetadataGroup = await bot.sock.groupMetadata(id);
            const fixMetadata: types.database.group = {
                ...MetadataGroup
            } as types.database.group;
            fixMetadata['subject'] = MetadataGroup.subject.replace(/\n/g, ' ');
            fixMetadata['desc'] = (String(MetadataGroup.desc));
            return fixMetadata;
        };
        
        if (bot.database.groups[id]) {
            const Metadata = await fetchMetadata();
            const JSONGroup: types.database.group = {
                ...defaults.group,
                ...bot.database.groups[id],
                ...Metadata
            } as types.database.group;
            bot.database.groups[id] = JSONGroup;
        } else if (!bot.database.groups[id]) {
            const Metadata = await fetchMetadata();
            const JSONGroup: types.database.group = {
                ...Metadata,
                ...defaults.group,
                gid: String(Object.keys(bot.database.groups).length)
            } as types.database.group;
            bot.database.groups[id] = JSONGroup;
        }
        
        bot.database.save();
    } catch (error) {
        bot.logger.error(error);
    }
};


export async function greetingHandler (bot, metadata) {}

export async function participantUpdate (bot, metadata) {
    const group = bot.database.groups[metadata.id] || defaults.group
    const user = bot.database.users[metadata.participants[0]] || defaults.user
    switch (metadata.action) {
        case 'add': {
            async function blacklist() {
                if (metadata.fromAdmin) return void 0;
                
                const list_blacklist = metadata.participants.filter(participant => {
                    const is_bl_participant = (!!(group.config?.blacklist?.participant || []).filter(bl_participant => {
                        return bl_participant == participant
                    })[0])
                    
                    const is_bl_country = (!!(group.config?.blacklist?.country || []).filter(bl_country => {
                        const parsePhone = parsePhoneNumber("+"+participant.split("@")[0]).toJSON()
                        if (!parsePhone.possible) return void 0;
                        
                        return bl_country == parsePhone.regionCode
                    })[0])
                    
                    return is_bl_participant || is_bl_country
                })
                
                if (list_blacklist.length > 0) {
                    for await(const participant of list_blacklist) {
                        await bot.sock.groupParticipantsUpdate(metadata.id, [participant], 'remove')
                    }
                }
                
                return !!list_blacklist.length
            }
            
            const isBlacklist = await blacklist()
            if (!isBlacklist && group.config.greeting.active) {
                //bot.sock.sendMessage(metadata.id, { text: "greting" })
                const pp = await bot.sock.profilePictureUrl(metadata.participants[0])
                const card_greeting = await utils.greeting.join({
                    url: {
                        pp
                    },
                    text: {
                        name: {
                            user: user.profile.name?.notify ?? user.profile.name?.contact,
                            group: group.subject
                        },
                        time: moment.tz('Asia/Makassar').format('hh:mmA dddd, DD MMMM Y'),
                        rank: group.participants.length + " members",
                        wm: "dxtstd-bot"
                    }
                }).then(buffer => {
                    const caption = (group.config.greeting.join || "Welcome on this group!")
                                    .replace("@user", metadata.participants?.map(v => "@" + v.split("@")[0]).join(" "))
                                    .replace("@subject", group.subject);
                    
                    return bot.sock.sendMessage(metadata.id, { image: buffer, caption, mentions: metadata.participants }, { ephemeralExpiration: (60*60*24) })
                })
                
            }
            break
        }
        case 'remove': {
            if (group.config.greeting.active) {
                
            }
            break
        }
        
        case 'promote': {
            if (group.config.greeting.active) {
                
            }
            break
        }
        case 'demote': {
            if (group.config.greeting.active) {
                
            }
            break
        }
        
        default: {
            
        }
    }
}

