import { downloadMediaMessage, proto } from "@adiwajshing/baileys"
import * as fs from "fs"

import { IsChatType, ChatType } from "../../Types"

const isMedia = function (type: string) {
    const MEDIA = {
        'audioMessage': true,
        'videoMessage': true,
        'imageMessage': true,
        'documentMessage': true,
        'stickerMessage': true
    } as any
    return MEDIA[type] ? true : false
}

const DownloadMessage = async function DownloadMessage(chat: any, opts: any={}) {
    if (!isMedia(chat.message.type)) return new Error()
    let result
    if (opts.stream) {
        result = await downloadMediaMessage(chat, 'stream', {})
    } else {
        result = await downloadMediaMessage(chat, 'buffer', {})
    }
    if (opts.path && !opts.stream) fs.writeFileSync(opts.path, result as any)
    return result
}

const is = function IsChat(this: IsChatType, chat: any) {
    const messageType = Object.keys(chat.message)[0];
    const chatCtxInfo = chat.message[messageType].contextInfo || {};
              
    this.baileys = (/*IF MD*/(chat.key.id.startsWith('BAE5')) ? true: (/*IF Not MD*/chat.key.id.startsWith('3EB0') ? true: false));
    this.forward = chatCtxInfo.isForwarding || false;
    this.media = isMedia(messageType);
    this.quoted = chatCtxInfo.quotedMessage ? true : false;                            
}

export function SimpleChat (this: any, chat: any, client: any) {
    chat = new proto.WebMessageInfo((chat.messages ? chat.messages[0] : {}))
    const message = chat.message
    if (!message) return
    
    if (Object.keys(message)[0] == "senderKeyDistributionMessage") {
        if (Object.keys(message)[1] == "messageContextInfo") {
            message.type = Object.keys(message)[2]
        } else message.type = Object.keys(message)[1]
    } else message.type = Object.keys(message)[0]
    
    chat.is = new (is as any)(chat)
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
        CQ.is = new (is as any)(CQ)


        CQ.download = async function(this: any, opts: any={}) {
            return await DownloadMessage(this, opts)
        }
        CQ.resend = async function (this: any, opts: any={}) {
            const RJ = this.key.remoteJid || opts.remoteJid
            return await client.relayMessage(RJ, this.message, { messageid: this.key.id })
        }
        
        return (new proto.WebMessageInfo(CQ))
    }

    this.messages = [chat]
} 