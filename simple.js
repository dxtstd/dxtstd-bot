const baileys = require('@adiwajshing/baileys')
const isMedia = function (tipex) {
    return (!/conversation/.test(tipex) && !/extendedText/.test(tipex))
}

const pengbuffer = exports.pengbuffer = async function (stream) {
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
    }
    return buffer
}

const downloadMsg = exports.downloadMsg = async function downloadMsg(chat) {
    let mType = Object.keys(chat.message)[0]
    if (mType != 'conversation' && mType != 'extendedTextMessage') {
        type = (mType === 'imageMessage' ? 'image': (mType === 'stickerMessage' ? 'image': (mType === 'videoMessage' ? 'video': (mType === 'audioMessage' ? 'audio': mType === 'documentMessage' ? 'document': undefined))))
        stream = await baileys.downloadContentFromMessage(chat.message[mType], type)
        return await pengbuffer(stream)
    } else {
        throw new Error('Pesan harus berupa media seperti gambar, video, atau apapun itu')
    }
}

exports.sdata = function sdata(client, chat) {
    const mengchat = chat
    const mengdata = {}
    mengchat.message = (Object.keys(mengchat.message)[0] === 'ephemeralMessage') ? mengchat.message.ephemeralMessage.message: mengchat.message;
    mengchat.message = (Object.keys(mengchat.message)[0] === 'viewOnceMessage') ? mengchat.message.viewOnceMessage.message: mengchat.message;
        
    mengdata.chat = mengchat;
    let mFrom = chat.key.remoteJid;
    mengdata.from = mFrom

    let mIs = {}
    mIs.group = mFrom.endsWith('@g.us')
    mIs.private = mFrom.endsWith('@s.whatsapp.net')
    mengdata.is = mIs

    let mSender = mIs.group ? mengchat.key.participant: mengchat.key.remoteJid
    mengdata.sender = mSender
    

    let mType = Object.keys(chat.message)[0] === 'senderKeyDistributionMessage' ? Object.keys(chat.message)[1]: Object.keys(chat.message)[0];
    mengdata.type = mType
    
    return mengdata
}

exports.schat = function schat(client, chat) {
    try {
        const mengchat = chat.messages[0]
        let xNo = client.user.id.split(":")
        

        const mType = mengchat.message.type = Object.keys(mengchat.message)[0]
        const cIMsg = mengchat.message[mType].contextInfo || {}
        
        
        //Chat Is
        const cIs = {}
        cIs.baileys = (/*IF MD*/(mengchat.key.id.startsWith('BAE5')) ? true: (/*IF Not MD*/mengchat.key.id.startsWith('3EB0') ? true: false));
        cIs.media = isMedia(mType)
        cIs.forward = cIMsg.isForwarding || false;
        cIs.quoted = cIMsg ? (/extendedText/.test(mType) && JSON.stringify(mengchat.message[mType]).match(/quoted/) ? true: false): false
        mengchat.is = cIs

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
                

                //QChat Is
                let qMIs = {}
                qMIs.baileys = ((qMsg.key.id.startsWith('BAE5')) ? true: (qMsg.key.id.startsWith('3EB0') ? true: false));
                qMIs.media = isMedia(qMType)
                qMIs.forward = cIQMsg.isForwarding || false;

                qMsg.is = qMIs

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