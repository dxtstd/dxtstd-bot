const baileys = require('@adiwajshing/baileys')
const fs = require('fs')

const isMedia = function (type) {
        const media = {
            imageMessage: true,
            videoMessage: true,
            stickerMessage: true,
            documentMessage: true,
            audioMessage: true
        };
        
        return (media[type] ? true : false);
    };
    
const pengbuffer = exports.pengbuffer = async function (stream) {
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
    }
    return buffer
}

const downloadMsg = exports.downloadMsg = async function downloadMsg(chat) {
    let mType = Object.keys(chat.message)[0]
    if (isMedia(mType)) {
        const type = (mType === 'imageMessage' ? 'image': (mType === 'stickerMessage' ? 'image': (mType === 'videoMessage' ? 'video': (mType === 'audioMessage' ? 'audio': mType === 'documentMessage' ? 'document': undefined))))
        const res = await baileys.downloadMediaMessage(chat, "buffer")
        return res
    } else {
        throw new Error('Pesan harus berupa media seperti gambar, video, atau apapun itu')
    }
}

exports.sdata = function sdata(client, chat, database) {
    const mengchat = chat
    const mengdata = {}
    mengchat.message = (Object.keys(mengchat.message)[0] === 'ephemeralMessage') ? mengchat.message.ephemeralMessage.message: mengchat.message;
    mengchat.message = (Object.keys(mengchat.message)[0] === 'viewOnceMessage') ? mengchat.message.viewOnceMessage.message: mengchat.message;
        
    mengdata.chat = mengchat;
    let mFrom = chat.key.remoteJid;
    mengdata.from = mFrom;

    let mIn = {};
    mIn.group = mFrom.endsWith('@g.us');
    mIn.private = mFrom.endsWith('@s.whatsapp.net');
    mengdata.in = mIn;

    let mSender = mIn.group ? mengchat.key.participant: mengchat.key.remoteJid;
    mengdata.sender = mSender;
    
    let mType = Object.keys(chat.message)[0] === 'senderKeyDistributionMessage' ? Object.keys(chat.message)[1]: Object.keys(chat.message)[0];
    mengdata.type = mType;
    
    mengdata.data = mengdata
    return mengdata;
};

exports.schat = function SimpleChat(client, chat) {
    chat = chat.messages ? chat.messages[0] : {};
    const message = chat.message;
    message.type = Object.keys(message)[0];
    
    const noPhone = client.user.id.split(":")[0];
    
    const is = function IsChat(chat) {
        const messageType = Object.keys(chat.message)[0];
        const chatCtxInfo = chat.message[messageType].contextInfo || {};
        
        this.baileys = (/*IF MD*/(chat.key.id.startsWith('BAE5')) ? true: (/*IF Not MD*/chat.key.id.startsWith('3EB0') ? true: false));
        this.forward = chatCtxInfo.isForwarding || false;
        this.media = isMedia(messageType);
        this.quoted = chatCtxInfo.quotedMessage ? true : false;
    };
    chat.is = new is(chat);
    
    const download = async function DownloadChat(chat, opts={}) {
        const hasil = await downloadMsg(chat)
        if (opts.path) return fs.writeFileSync(opts.path, hasil);
        
        return hasil
    };
    
    const resend = async function ResendChat(chat, opts={}) {
        let Jid = opts.remoteJid || chat.key.remoteJid
        return await client.relayMessage(Jid, chat.message, chat.key.id)
    };
    
    const quoted = function QuotedChat() {
        if (!chat.is.quoted) return {};
        const chatQuoted = {};
        const chatQuotedObject = chat.message[chat.message.type].contextInfo;
        
        //KEY
        const quotedKey = {};
        quotedKey.id = chatQuotedObject.stanzaId;
        chat.key.remoteJid.endsWith('@g.us') ? (quotedKey.remoteJid = chat.key.remoteJid, quotedKey.participant = chatQuotedObject.participant) : (quotedKey.remoteJid = chatQuotedObject.participant);
        
        chat.key.remoteJid.endsWith('@g.us') ? (quotedKey.fromMe = (quotedKey.participant.match(`${noPhone}@s.whatsapp.net`) ? true : false)) : (quotedKey.remoteJid.match(`${noPhone}@s.whatsapp.net`) ? true : false)
        chatQuoted.key = quotedKey;
        
        //MESSAGE
        chatQuoted.message = chatQuotedObject.quotedMessage
        chatQuoted.message.type = Object.keys(chatQuoted.message)[0];
        chatQuoted.is = new is(chatQuoted)
        
        chatQuoted.resend = async function ResendChat(opts={}) { return await resend(chatQuoted, opts) };
        chatQuoted.download = async function DownloadChat(opts={}) { return await download(chatQuoted, opts) };
        return chatQuoted;
    };
    
    message.quoted = quoted;
    
    chat.resend = async function ResendChat(opts={}) { return await resend(chat, opts) };
    chat.download = async function DownloadChat(opts={}) { return await download(chat, opts) };
    
    chat.message = message;
    this.messages = [(chat)];
};

`
exports.schat = function schat(client, chat) {
    try {
        const mengchat = chat.messages[0]
        let xNo = client.user.id.split(":")
        
        const mType = mengchat.message.type = Object.keys(mengchat.message)[0]
        const cIMsg = mengchat.message[mType].contextInfo || {}
        
        //Chat Is
        const chatIs = function (chat) {
            const cType = Object.keys(chat.message)[0]
            const cCtx = chat.message[cType].contextInfo || {}
            const is = {}
            is.baileys = (/*IF MD*/(chat.key.id.startsWith('BAE5')) ? true: (/*IF Not MD*/chat.key.id.startsWith('3EB0') ? true: false));
            is.media = isMedia(cType)
            is.forward = cIMsg.isForwarding || false;
            is.quoted = cIMsg ? (/extendedText/.test(cType) && JSON.stringify(mengchat.message[cType]).match(/quoted/) ? true: false): false
            return is
        }
        
        mengchat.is = chatIs(mengchat)
        
        //IsQuoted
        //console.log(mengchat)
        //console.log(mengchat)
        if (cIs.quoted) {
            mengchat.message.quoted = function () {
                const quotedMsg = mengchat.message.extendedTextMessage.contextInfo

                const qMsg = {}
                qMsg.key = {
                    id: quotedMsg.stanzaId,
                    participant: quotedMsg.participant,
                    fromMe: (quotedMsg.participant === xNo[0] + "@" +xNo[1].split("@")[1])
                }
                qMsg.message = quotedMsg.quotedMessage
                let qMType = qMsg.message.type = Object.keys(qMsg.message)[0]
                const cIQMsg = qMsg.message[qMType].contextInfo || {}
                
                //qMsg.messageTimestamp = mengchat.messageTimestamp
                

                //QChat Is;
                qMsg.is = chatIs(qMIs)

                //Function
                qMsg.download = async function () {
                    return await downloadMsg(qMsg)
                }

                qMsg.resend = async function (rJid) {
                    rJid = rJid || mengchat.key.remoteJid
                    return await client.relayMessage(rJid, qMsg.message, qMsg.key.id)
                }

                qMsg.forward = async function (fJid) {
                    fJid = fJid || mengchat.key.remoteJid
                    fQMsg = qMsg;
                    cIfQMsg = fQMsg.message[qMType].contextInfo || {}
                    cIfQMsg.isForwardim = true;
                    cIfQMsg.forwardingScore = 1
                    fQMsg.message[qMType].contextInfo = cIfQMsg
                    
                    if (/conversation/.test(Object.keys(fQMsg.message)[0])) fQMsg.message = { extendedTextMessage: fQMsg.message['conversation'] }
                    return await client.relayMessage(fJid, fQMsg.message, fQMsg.key.id)
                }
                return qMsg
            }
        }
        
        return mengchat
    } catch (e) {
        console.log(chat)
    }
}
`