import { downloadMediaMessage, proto } from "@adiwajshing/baileys"
import * as fs from "fs"

import { IsChatType, ChatType } from "../../Types"

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
    chat: any, opts: any={}
): Promise<any> {
    if (!isMedia(chat.message.type)) return new Error()
    let result
    if (opts.stream) {
        result = await downloadMediaMessage(chat, 'stream', {})
    } else {
        result = await downloadMediaMessage(chat, 'buffer', {})
    }
    if (opts.path && !opts.stream) fs.writeFileSync(opts.path, Buffer.from(result))
    return result
}

const is = function IsChat (
    this: IsChatType, { key, message }
): void {
    const messageType = Object.keys(message)[0];
    const chatCtxInfo = message[messageType].contextInfo || {};
       
    this.baileys = (/*IF MD*/(key.id.startsWith('BAE5')) ? true: (/*IF Not MD*/key.id.startsWith('3EB0') ? true: false));
    this.forward = chatCtxInfo.isForwarding || false;
    this.media = isMedia(messageType);
    this.quoted = chatCtxInfo.quotedMessage ? true : false;
}

/**
 * Simplify messages
 *
 * @param client - Baileys WASocket
 * 
 */
const SimpleChat = function (
    [ chat ], client
): proto.WebMessageInfo {
    let { message } = chat;
    if (!message) {
        return (new proto.WebMessageInfo())
    }
    
    if (Object.keys(message)[0] == "senderKeyDistributionMessage") {
        if (Object.keys(message)[1] == "messageContextInfo") {
            message.type = Object.keys(message)[2]
        } else message.type = Object.keys(message)[1]
    } else message.type = Object.keys(message)[0]
    
    chat.is = new is(chat)
    chat.download = async function(this: any, opts: any={}) {
        return await DownloadMessage(this, opts)
    }
    chat.resend = async function (this: any, opts: any={}) {
        const RJ = this.key.remoteJid || opts.remoteJid
        return await client.relayMessage(RJ, this.message, { messageid: this.key.id })
    }

    chat.message.quoted = function () {
        if (!chat.is.quoted) return {}
        const CQ = {} as any
        const CQO = chat.message[chat.message.type].contextInfo
        
        //Quoted Key
        const QK = {} as any
        QK.id = CQO.stanzaId
        
        chat.key.remoteJid.endsWith('@g.us') ? (QK.remoteJid = chat.key.remoteJid, QK.participant = CQO.participant) : (QK.remoteJid = CQO.participant, QK.participant = undefined)
        
        QK.fromMe = false
        CQ.key = QK
        
        //Quoted Message
        CQ.message = CQO.quotedMessage
        CQ.message.type = Object.keys(CQ.message)[0]
        CQ.is = new is(CQ)


        CQ.download = async function(this: any, opts: any={}) {
            return await DownloadMessage(this, opts)
        }
        CQ.resend = async function (this: any, opts: any={}) {
            const RJ = this.key.remoteJid || opts.remoteJid
            return await client.relayMessage(RJ, this.message, { messageid: this.key.id })
        }
        
        return (new proto.WebMessageInfo(CQ))
    }
    return new proto.WebMessageInfo(chat)
}

export {
    SimpleChat
}