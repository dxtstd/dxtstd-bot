import { logger } from '../../Utils';

import { SimpleData } from '../Simpler';
import { GROUP } from '../../Defaults';

import { GroupType } from '../../Types';

export async function GroupHandler (chat, client, database) {
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

export async function GroupParticipantHandler (group, client, database) {
    try {
        
    } catch (error) {
        
    }
};