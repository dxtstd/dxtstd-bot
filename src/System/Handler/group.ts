import { greeting, logger } from '../../Utils';

import { SimpleData } from '../Simpler';
import { GROUP } from '../../Defaults';

import { GroupType } from '../../Types';

import {
	parsePhoneNumber
} from 'awesome-phonenumber'

import * as moment from 'moment-timezone';

/**
 * Handler to refresh group data
 * 
 * @param chat - Message Received From Baileys
 * @param client - Baileys WASocket
 * @param database - Database Bot
 */
 
const GroupHandler = async function (
    id, client, database
): Promise<void> {
    try {
        if (!id.endsWith('@g.us')) return;
        database.load();
        
        const fetchMetadata = async function () {
            const MetadataGroup = await client.groupMetadata(id);
            const fixMetadata: GroupType = {
                ...MetadataGroup
            } as GroupType;
            fixMetadata['subject'] = MetadataGroup.subject.replace(/\n/g, ' ');
            fixMetadata['desc'] = (String(MetadataGroup.desc));
            return fixMetadata;
        };
        
        if (database.groups[id]) {
            const Metadata = await fetchMetadata();
            const JSONGroup: GroupType = {
                ...GROUP,
                ...database.groups[id],
                ...Metadata
            } as GroupType;
            database.groups[id] = JSONGroup;
        } else if (!database.groups[id]) {
            const Metadata = await fetchMetadata();
            const JSONGroup: GroupType = {
                gid: String(Object.keys(database.groups).length),
                ...Metadata,
                ...GROUP
            } as GroupType;
            database.groups[id] = JSONGroup;
        }
        
        database.save();
    } catch (error) {
        logger.error(error);
    }
};

/**
 * Handler for group members
 * 
 *  
 * @param client - Baileys WASocket
 * @param database - Database Bot
 * 
 * 
 */
const GroupParticipantHandler = async function (
    { id, participants, action }, client, database
): Promise<void> {
    try {
        GroupHandler(id, client, database)
        database.load()
        const group = database.groups[id]
        const user = database.users[participants[0]] || {}
        if (!group.config.greeting.active) return;
        
        const Phone = parsePhoneNumber('+'+participants[0].split('@')[0]).toJSON().number.international
        
        if (action == 'add') {
            const TextGreeting = {
                wm: 'dxtstd-bot',
                name: {
                    user: (('profile' in user) ? (user.profile.name.contact || user.profile.name.notify || Phone) : Phone),
                    group: group.subject
                },
                time: moment.tz('Asia/Makassar').format('hh:mmA dddd, DD MMMM Y') 
            }
            let UrlPP;
            try {
                UrlPP = await client.profilePictureUrl(participants[0], 'image')
            } catch (error) {}
            const UrlGreeting = {
                pp: UrlPP
            }
            
            const card = await greeting.join({ url: UrlGreeting, text: TextGreeting })
            const text = ReplacementTextGreeting(group.config.greeting.join, {
                user: (participants.map(participant => {
                    return participant.split('@')[0]
                }).join(' ,')),
                group: group.subject,
                desc: group.desc
            })
            
            client.sendMessage(id, {
                image: card,
                caption: text,
                contextInfo: {
                    mentionedJid: participants
                }
            })
        }
        
        if (action == 'remove') {
            const TextGreeting = {
                wm: 'dxtstd-bot',
                name: {
                    user: (('profile' in user) ? (user.profile.name.contact || user.profile.name.notify || Phone) : Phone),
                    group: group.subject
                },
                time: moment.tz('Asia/Makassar').format('hh:mmA dddd, DD MMMM Y') 
            }
            let UrlPP;
            try {
                UrlPP = await client.profilePictureUrl(participants[0], 'image')
            } catch (error) {}
            const UrlGreeting = {
                pp: UrlPP
            }
            
            const card = await greeting.leave({ url: UrlGreeting, text: TextGreeting })
            const text = ReplacementTextGreeting(group.config.greeting.leave, {
                user: (participants.map(participant => {
                    return participant.split('@')[0]
                }).join(' ,')),
                group: group.subject,
                desc: group.desc
            })
            
            client.sendMessage(id, {
                image: card,
                caption: text,
                contextInfo: {
                    mentionedJid: participants
                }
            })
        }
        
    } catch (error) {
        logger.error(error)
    }
};

const ReplacementTextGreeting = (text, {user, group, desc} ) => {
    text = text.replace('@user', '@' + user)
    text = text.replace('@subject', group)
    text = text.replace('@desc', desc)
    
    return text
}

export {
    GroupHandler,
    GroupParticipantHandler
}