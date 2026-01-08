import {
    downloadMediaMessage,
    getContentType,
    isJidGroup,
    normalizeMessageContent,
    proto
} from "@adiwajshing/baileys";

import * as fs from "fs"

import * as groupHandler from '../Handler/group'
import * as types from '../../Types'

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
    if (!isMedia(m.type)) return new Error('message is not media!')
    let result
    if (opts.stream) {
        result = await downloadMediaMessage(m, 'stream', {})
    } else {
        result = await downloadMediaMessage(m, 'buffer', {})
    }
    if (opts.path && !opts.stream) fs.writeFileSync(opts.path, Buffer.from(result))
    return result
}

type T_m = proto.IWebMessageInfo & Partial<types.message.IMessage>

const SimpleMessage = function (message): T_m {
    const m: T_m = message;
    
    m.message ? (m.type = getContentType(m.message)) : (m.type = "", m.message = {});
    
    m.sender = m.key.participant ?? m.participant ?? (m.key.remoteJid) ??  '';
    m.from = isJidGroup(m.key.remoteJid) ? m.key.remoteJid : m.sender;
    m.message =
        m.message?.ephemeralMessage || m.message?.viewOnceMessage
        ? normalizeMessageContent(m.message) : m.message;
        
   if (m.message[m.type]?.contextInfo?.quotedMessage) {
       const quotedStoreMessage: T_m|undefined= this.database.store.messages[m.from]?.get(m.message[m.type]?.contextInfo?.stanzaId)
        if (!!quotedStoreMessage) {
            m.quoted = (SimpleMessage.bind(this))(quotedStoreMessage)
        } else {
            m.quoted = (SimpleMessage.bind(this))({
                key: {
                    id: m.message[m.type]?.contextInfo?.stanzaId,
                    remoteJid: m.from,
                    participant: m.message[m.type]?.contextInfo?.participant,
                    fromMe: m.message[m.type]?.contextInfo?.participant == ((this.sock.user.id).split(':')[0] + '@s.whatsapp.net')
                },
                message: m.message[m.type]?.contextInfo?.quotedMessage
            })
        }
    } else { m.quoted = null }
        
    m.on = {
        group: isJidGroup(m.from),
        private: !isJidGroup(m.from)
    };
    
    m.group = (() => { 
        return this.database.groups[m.from] ?? {}
    })() as types.database.group;
    
    m.user = (() => { 
        return this.database.users[m.sender] ?? {}
    })() as types.database.user;
    
    m.user.is = {
        admin: {
            super:(m.group.participants ? (m.group.participants.filter(({ id }) => {
                return (id == m.sender)
            })[0]?.admin == 'superadmin') : false),
            normal: (m.group.participants ? (m.group.participants.filter(({ id }) => {
                return (id == m.sender)
            })[0]?.admin == 'admin') : false),
            bot: (m.sender.split("@")[0] in this.database.config.administrator)
        }
    };
    
    m.name = {
        group: m.group?.subject,
        user:  m.user?.profile?.name.contact 
            || m.user?.profile?.name.notify 
            || m.pushName 
            || ''
    }
    
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
    
    m.text = this.fetchText(text);
    
    const { sock } = this;
    
    m.download = async function(this: T_m, opts: any={}): Promise<any> {
        return DownloadMessage(this, opts)
    };
    m.resend = async function (this: T_m, opts: any={}): Promise<any> {
        const RJ = opts.remoteJid || this.key.remoteJid 
        return sock.relayMessage(RJ, this.message, { messageid: this.key.id })
    };
    m.reply = async function (this: T_m, content: any, opts: any={}): Promise<any> {
        return sock.sendMessage(this.from, content, { quoted: this, ...opts })
    };
    
    return m
} 

export async function message ({ messages, type }): Promise<void> {
    const m: T_m = (SimpleMessage.bind(this))(messages[0]);
    if (!this.database.groups[m.from]) groupHandler.updateData(this, m.from)
    
    //console.log(m)
    if (m.messageStubType) {
        const MST = m.messageStubType;
        const MSP  = m.messageStubParameters;
        //console.log(MST, MSP);
        switch (MST) {
            //Group Action
            case 27:
            case 28:
            case 31:
            case 32: {
                this.events.emit('group.participant.update', {
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
                this.events.emit('group.participant.update', {
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
        
        const groupUpdateMetadata = ([20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 43, 44, 133, 134, 135, 136, 137, 138, 139, 140, 142, 142, 144, 145, 146, 147, 148, 149, 150, 151, 158, 159, 161].filter((stub: number) => stub == MST)[0])
        console.log("groupUpdateMetadata:", groupUpdateMetadata)
        
        !!groupUpdateMetadata ? (await groupHandler.updateData(this, m.from), this.events.emit('group.metadata.update', {
            stub: MST,
            id: m.from
        })) : void 0
    };
    
    this.events.emit('contact.update', {
        id: m.sender,
        notify: m.pushName
    })
    
    //console.log(m, type)
    if (m.message) {
        this.events.emit('message.receive', m);
    };
}