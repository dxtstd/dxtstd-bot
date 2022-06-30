import { logger } from '../../Utils';

import { SimpleData } from '../Simpler';
import { GROUP } from '../../Defaults';

import { GroupType } from '../../Types';

/**
 * Handler to refresh group data
 * 
 * @param chat - Message Received From Baileys
 * @param client - Baileys WASocket
 * @param database - Database Bot
 */
 
const GroupHandler = async function (
    chat, client, database
): Promise<void> {
    try {
        const data = SimpleData(chat, database);
        if (data.on.private) return;
        database.load();
        
        const fetchMetadata = async function () {
            const MetadataGroup = await client.groupMetadata(data.from);
            const fixMetadata: GroupType = {
                ...MetadataGroup
            } as GroupType;
            fixMetadata['subject'] = MetadataGroup.subject.replace(/\n/g, ' ');
            fixMetadata['desc'] = (String(MetadataGroup.desc));
            return fixMetadata;
        };
        
        if (database.groups[data.from]) {
            const Metadata = await fetchMetadata();
            const JSONGroup: GroupType = {
                ...database.groups[data.from],
                ...Metadata
            } as GroupType;
            database.groups[data.from] = JSONGroup;
        } else if (!database.groups[data.from]) {
            const Metadata = await fetchMetadata();
            const JSONGroup: GroupType = {
                gid: String(Object.keys(database.groups).length),
                ...Metadata,
                ...GROUP
            } as GroupType;
            database.groups[data.from] = JSONGroup;
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
        /* */
    } catch (error) {
        logger.error(error)
    }
};

export {
    GroupHandler,
    GroupParticipantHandler
}