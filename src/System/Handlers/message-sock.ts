import {
    downloadMediaMessage,
    getContentType,
    isJidGroup,
    normalizeMessageContent,
    proto
} from "@whiskeysockets/baileys";

import * as fs from "fs"

import * as group from './group'
import * as types from '../../Types'
import * as handler from "../Handlers"
import { Bot } from "../init"

const isMedia = function (
    type: string
): boolean {
    const MEDIA = {
        'audioMessage': true,
        'videoMessage': true,
        'imageMessage': true,
        'documentMessage': true,
        'stickerMessage': true
    } as any
    return MEDIA[type] ? true : false
}

const DownloadMessage = async function (
    m: any, opts: any={}
): Promise<any> {
    if (!isMedia(m.type)) throw new Error('message is not media!')
    let result
    if (opts.stream) {
        result = await downloadMediaMessage(m, 'stream', {})
    } else {
        result = await downloadMediaMessage(m, 'buffer', {})
    }
    if (opts.path && !opts.stream) fs.writeFileSync(opts.path, Buffer.from(result))
    return result
}

const SimpleMessage = async function (this: Bot, message): Promise<types.message> {
    const m: types.message = message;
    
    m.message ? (m.type = getContentType(m.message)) : (m.type = "", m.message = {});
    m.sender = (m.key.fromMe ? this.sock.user.id : void 0) ?? m.participant ?? m.key.participant ?? (m.key.remoteJid);
    m.from = isJidGroup(m.key.remoteJid) ? m.key.remoteJid : m.sender;
    m.message =
        m.message?.ephemeralMessage || m.message?.viewOnceMessage
        ? normalizeMessageContent(m.message) : m.message;
        
   if (m.message[m.type]?.contextInfo?.quotedMessage) {
       //const quotedStoreMessage: T_m|undefined= this.database.store.messages[m.from]?.get(m.message[m.type]?.contextInfo?.stanzaId)
        if (!!false) {
            //m.quoted = (SimpleMessage.bind(this))(quotedStoreMessage)
        } else {
            m.quoted = await (SimpleMessage.bind(this))({
                key: {
                    id: m.message[m.type]?.contextInfo?.stanzaId,
                    remoteJid: m.from,
                    participant: m.message[m.type]?.contextInfo?.participant,
                    fromMe: m.message[m.type]?.contextInfo?.participant == ((this.sock.user.id).split(':')[0] + '@s.whatsapp.net')
                },
                message: m.message[m.type]?.contextInfo?.quotedMessage
            });
        }
    } else { m.quoted = null };
        
    m.on = {
        group: isJidGroup(m.from),
        private: !isJidGroup(m.from)
    };
    
    m.group = (m.from ? (await this.database.read("groups", m.from)) : {}) as (types.database.data["group"]);
    m.user = (m.sender ? (await this.database.read("users", m.sender ?? "null@s.whatsapp.net")) : {}) as (types.database.data["user"]);
    
    m.name = {
        group: m.group?.subject,
        user:  m.user?.profile?.name.contact 
            || m.user?.profile?.name.notify 
            || m.pushName 
            || ''
    };
    
    const text: string =  (
        typeof m.message[m.type] == 'string' ?
               m.message[m.type] : false
        ||
        typeof m.message[m.type]?.caption == 'string' ?
               m.message[m.type].caption : false 
        ||
        typeof m.message[m.type]?.text  == 'string' ?
               m.message[m.type].text : false
        ||
        typeof m.message[m.type]?.selectedDisplayText == 'string' ?
              m.message[m.type].selectedDisplayText : false
        ||
        String('')
    );

    
    m.text = this.fetchText(text)
    
    const { sock } = this;
    const mybot = this
    
    m.download = async function(this: types.message, opts: any={}): Promise<any> {
        return DownloadMessage(this, opts)
    };
    m.send = async function (this: types.message, content: any, opts: any={}): Promise<types.message> {
        return sock.sendMessage(this.from, content, { ...opts })
        .then((WMI) => SimpleMessage.bind(mybot)(WMI))
    };
    m.resend = async function (this: types.message, opts: any={}): Promise<types.message> {
        const RJ = opts.remoteJid || this.key.remoteJid 
        return sock.relayMessage(RJ, this.message, { messageid: this.key.id, ...opts })
        .then((WMI) => SimpleMessage.bind(mybot)(WMI))
    };
    m.reply = async function (this: types.message, content: any, opts: any={}): Promise<types.message> {
        return sock.sendMessage(this.from, content, { quoted: this, ...opts })
        .then((WMI) => SimpleMessage.bind(mybot)(WMI))
    };
    m.delete = async function(this: types.message, opts: any={}): Promise<types.message> {
        return sock.sendMessage(this.from, {
            delete: this.key
        }, opts)
        .then((WMI) => SimpleMessage.bind(mybot)(WMI))
    }
    m.edit = async function(this: types.message, content: any, opts: any={}): Promise<types.message> {
        return sock.sendMessage(this.from, {
            ...content,
            edit: this.key
        }, opts)
        .then((WMI) => SimpleMessage.bind(mybot)(WMI))
    }
    
    return m;
} 

export async function listener(this: Bot, { messages, type }): Promise<void> {
    const m: types.message = await (SimpleMessage.bind(this))(messages[0]);

    if (!(await this.database.exists("groups", m.from))) group.updateDatabase.bind(this)(m.from)
    await handler.user.updateDatabase.bind(this)({
        id: m.sender,
        notify: m.pushName
    }) && this.event.emit('contact.update', {
        id: m.sender,
        notify: m.pushName
    });

    if (m.messageStubType) {
        const MST = m.messageStubType;
        const MSP  = m.messageStubParameters;
        switch (MST) {
            //Group Action
            case 27:
            case 28:
            case 31:
            case 32: {
                this.event.emit('group.participant.update', {
                    id: m.from,
                    participants: MSP as string[],
                    action: ((MST == 27 || MST == 31) ? 'add' : 'remove'),
                    admin: (MST == 27 || MST == 28) ? (m.sender != MSP[0] ? m.sender : false) : '',
                    fromAdmin: !!(m.sender != MSP[0] ? m.sender : false)
                });
                break;
            }
            
            case 29:
            case 30: {
                this.event.emit('group.participant.update', {
                    id: m.from,
                    participants: MSP as string[],
                    action: ((MST == 29) ? 'promote' : 'demote'),
                    admin: m.sender,
                    fromAdmin: !!m.sender
                });
                break;
            }
            //Chat Action
        };
        
        const groupUpdateMetadata = ([20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 43, 44, 133, 134, 135, 136, 137, 138, 139, 140, 142, 142, 144, 145, 146, 147, 148, 149, 150, 151, 158, 159, 161]
                                    .filter((stub: number) => stub == MST)[0])
        console.log("groupUpdateMetadata:", groupUpdateMetadata)
        
        !!groupUpdateMetadata ? (
            (groupUpdateMetadata == 32 || groupUpdateMetadata == 28 ) && this.sock.user.id.split(":")[0]+"@s.whatsapp.net" == MSP[0] ? 
            void 0 : (await group.updateDatabase.bind(this)(m.from)), this.event.emit('group.metadata.update', {
            stub: MST,
            id: m.from
        })) : void 0
    };

    if (m.message) {
        this.event.emit('message.receive', (await (SimpleMessage.bind(this))(messages[0])));
    };
}