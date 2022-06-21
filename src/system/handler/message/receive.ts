import { SimpleChat, SimpleData } from '../../simpler';
import { CommandHandler } from '../command';
import { logger } from '../../../lib';
import { GroupHandler } from '..'

import chalk from 'chalk';
import * as util from 'util';

const coloringText = function (text: string, color: string) {
    return !color ? chalk.keyword('white')(text) : chalk.keyword(color)(text)
};

const coloringBGText = function (text: string, color: string) {
    return !color ? chalk.bgKeyword('white')(text) : chalk.bgKeyword(color)(text)
};

export async function ReceiverMessageHandler(chat: any, client: any, database: any) {
    try {
        if (!chat) return;
        if (chat.type === 'append') return;

        chat = (new (SimpleChat as any)(chat, client)).messages[0];
        if (!chat.message) return;
        if (chat.key && chat.key.remoteJid == 'status@broadcast') return;

        
        await GroupHandler(chat, client, database)
        const data = SimpleData(chat, database);
        const fetchLog = function (object: any) {
            let text = coloringText('"' + object.text.full + '"', 'white');
            text += coloringText(' From: ', 'yellow');
            text += object.name.user;
            if (object.on.group) {
                text += coloringText(' Group: ', 'yellow');
                text += object.name.group;
            };
            text += coloringText(' MessageType: ' + object.type, 'lime');
            return text;
        };
        
        if (data.text.command) logger.command(fetchLog(data));
            else logger.message(fetchLog(data));
            
        if (database.config.ReadOnly) return

        if (data.text.command) {
            CommandHandler(client, { data, database })
        };
        

    } catch (error) {
        logger.error(error);
    };
};
