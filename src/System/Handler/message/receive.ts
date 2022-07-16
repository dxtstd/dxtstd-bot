import { SimpleChat, SimpleData } from '../../Simpler';
import { CommandHandler } from '../command';
import { logger } from '../../../Utils';
import { AntiHandler ,GroupHandler } from '..'

import chalk from 'chalk';

const coloringText = function (
    text: string, color: string
): string {
    return !color ? chalk.keyword('white')(text) : chalk.keyword(color)(text)
};

/**
 * Handler for receiving messages
 *
 * @param client - Baileys WASocket
 * @param database - Database Bot
 *
 */
const ReceiverMessageHandler = async function (
    { messages, type }, client, database
): Promise<void> {
    try {
        //Simpling Chat
        const chat = SimpleChat(messages, client);
        if (!chat.message) return;
        if (chat.key && chat.key.remoteJid == 'status@broadcast') return;
        if (chat.key.fromMe) return;
        
        //add additional handler
        await GroupHandler(chat.key.remoteJid, client, database)
        
        //Simpling Data
        const data = SimpleData(chat, database);
        
        await AntiHandler(chat, client, { data, database })
        //Simpling Log
        const fetchLog = function (): string {
            let text = coloringText('"' + data.text.full + '"', 'white');
            text += coloringText(' From: ', 'yellow');
            text += data.name.user;
            if (data.on.group) {
                text += coloringText(' Group: ', 'yellow');
                text += data.name.group;
            }
            text += coloringText(' MessageType: ' + data.type, 'lime');
            return text;
        };
        
        //Read Message
        client.readMessages([chat.key]);
        
        //Logging
        if (data.text.command) logger.command(fetchLog());
            else logger.message(fetchLog());
            
        if (database.config.ReadOnly) return;
        
        //Handler Command
        if (data.text.command) {
            CommandHandler(client, { data, database })
        }
        
        //console.log(data)
    } catch (error) {
        logger.error(error);
    }
};

export {
    ReceiverMessageHandler
}