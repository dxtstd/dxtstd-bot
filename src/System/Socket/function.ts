import { fromBuffer as checkMime } from 'file-type'
import { 
    generateMessageID,
    proto, 
    AnyMessageContent,
    AnyMediaMessageContent,
    WAMessageContent,
    prepareWAMessageMedia
} from '@adiwajshing/baileys'
import * as crypto from 'crypto'

interface ValueButton {
    text: string,
    command: string,
    url: string,
    phone: string,
    type: string|number
}

interface MessageTypeProto {
	image: proto.Message.ImageMessage;
	video: proto.Message.VideoMessage;
	audio: proto.Message.AudioMessage;
	sticker: proto.Message.StickerMessage;
   	document: proto.Message.DocumentMessage;
}

function getMediaMessage (message: any): string {
    if ('image' in message && !!message.image) return 'image'
    if ('video' in message && !!message.video) return 'video'
    if ('audio' in message && !!message.audio) return 'audio'
    if ('sticker' in message && !!message.sticker) return 'sticker'
    if ('document' in message && !!message.document) return 'document'
    return ''
}

export const sendButton = async function (
    this: any,
    jid: string, 
    content: Partial<{
        media: MessageTypeProto;
        text: string;
        footer: string;
        buttons: Partial<ValueButton>[],
        templateButtons: Partial<ValueButton>[]
        headerType: number,
        contextInfo: any
    }>,
    opts: any={}
): Promise<any> {
    const ButtonType = proto.Message.ButtonsMessage.HeaderType

    const response: any = {
        buttons: {},
        
        onceRespond: !!(opts.onceRespond)
    }
    const buttons: any = []
    let typeButton = ""
    
    let typeMedia = getMediaMessage(content.media||{})
    
    let m: WAMessageContent = { }
    
    const buttonsMessage: Partial<proto.Message.ButtonsMessage & proto.Message.TemplateMessage> = {}
    if (("templateButtons" in content) && (!!content.templateButtons)) {
        typeButton = "templateButtons"
        content.templateButtons.forEach((value) => {
            const hash = crypto.randomBytes(16).toString('hex')
            switch (value.type) {
                case 'url': {
                    buttons.push({
                        index: buttons.length,
                        urlButton: {
                            displayText: value.text || 'Example URL',
                            url: value.url || 'https://example.com'
                        }
                    })
                    break
                }
                case 'copy': {
                    buttons.push({
                        index: buttons.length,
                        urlButton: {
                            displayText: value.text || 'Example Copy ',
                            url: ('https://www.whatsapp.com/otp/copy/') + (value.url || 'https://example.com')
                        }
                    })
                    break
                }
                case 'call': {
                    buttons.push({
                        index: buttons.length,
                        callButton: {
                            displayText: value.text || 'Example Call',
                            phoneNumber: value.phone || '+62 812-4286-0439'
                        }
                    })
                    break
                }
                case 'reply':
                default: {
                    response.buttons[hash] = {
                        text: value.text || 'Example Reply',
                        command: value.command || '/test value1',
                        pressed: false
                    }
                    
                    buttons.push({
                        index: buttons.length,
                        quickReplyButton: {
                            displayText: value.text || 'Example Reply',
                            id: hash
                        }
                    })
                } 
            }
        })
        
        
        const msg = {
            hydratedContentText: ((content.text) || 'Example'),
            hydratedFooterText: content.footer || 'dxtstd-bot',
            hydratedButtons: buttons
        }
        
        if (!!typeMedia) {
            const msgMedia = await prepareWAMessageMedia(
                (content.media as AnyMediaMessageContent),
                { upload: this.sock.waUploadToServer, ...opts }
            )
            
            Object.assign(msg, msgMedia)
        }
        
        buttonsMessage.contextInfo = content.contextInfo
        buttonsMessage.hydratedTemplate = msg
        buttonsMessage.hydratedFourRowTemplate = msg
        
        m = {
            templateMessage: buttonsMessage
        }
        
    } else if (("buttons" in content) && (!!content.buttons)) {
        typeButton = "buttons"
        content.buttons.forEach((value) => {
            const hash = crypto.randomBytes(16).toString('hex')
            response.buttons[hash] = {
                text: value.text || 'Example',
                command: value.command || '/test value1',
                pressed: false
            }
            
               buttons.push({
                    buttonId: hash,
                    buttonText: { displayText: (value.text || 'Example') },
                    type: value.type || 1
            })
        })
        
        if (!!typeMedia) {
            const msgMedia = await prepareWAMessageMedia(
                (content.media as AnyMediaMessageContent),
                { upload: this.sock.waUploadToServer, ...opts }
            )
            
            Object.assign(buttonsMessage, msgMedia)
        }
        
        buttonsMessage.contextInfo = content.contextInfo
        buttonsMessage.contentText = ((content.text) || 'Example')
        buttonsMessage.footerText = content.footer || 'dxtstd-bot'
        buttonsMessage.buttons = buttons
        buttonsMessage.headerType = ButtonType[typeMedia.toUpperCase()] || (1)
        
        m = {
            buttonsMessage
        }
        
    } else {
//        if (!!typeMedia) {
//            const msgMedia = await prepareWAMessageMedia(
//                (content.media as AnyMediaMessageContent),
//                { upload: this.sock.waUploadToServer,...opts }
//            )
//            
//            Object.assign(buttonsMessage, msgMedia)
//        }
//        
//        m = {
//            buttonsMessage
//        }
    }
    
    const msgID = generateMessageID()
    
    this.database.load()
    this.database.response.button[msgID] = response
    this.database.save()
    
    
    const result = await this.sock.relayMessage(jid, {
        viewOnceMessage: {
            message: proto.Message.fromObject(m)
        }
    }, { messageId: msgID, ...opts })
    
    return {
        key: {
            id: result
        },
        message: proto.Message.fromObject(m)
    }
}

const makeBackgroundRequestPayment = async function (image, opts): Promise<any> {
    const { imageMessage } = await prepareWAMessageMedia({ image }, opts)
    
    const background = {
        id: generateMessageID(),
        width: 1280*0.5,
        heigth: 720*0.5,
        subtextArgs: 0,
        placeholderArgb: 0,
        textArgb: 0,
        fileLength: {},
        mimetype: '',
        mediaData: {},
        type: 1
    } as any
    
    const mediaData = {
        mediaKey: '',
        mediaKeyTimestamp: '',
        fileSha256: '',
        fileEncSha256: '',
        directPath: ''
    } as any
    
    Object.keys(mediaData).forEach(data => {
        !!imageMessage[data] ? (mediaData[data] = imageMessage[data]) : void 0
    })
    Object.keys(background).forEach(data => {
        !!imageMessage[data] ? (mediaData[data] = imageMessage[data]) : void 0
    })
    
    background['mediaData'] = mediaData
    return background
}

export const sendRequestPayment = async function (
    this: any,
    jid: string,
    content: Partial<{
        image: any,
        text: string,
        amount: number,
        currency: string,
        from: string
    }>,
    opts: any
) {
    const requestPaymentMessage: Partial<proto.Message.RequestPaymentMessage> = { amount: {
            currencyCode: content.currency || 'USD',
            offset: 0,
            value: content.amount || 9.99
        },
        expiryTimestamp: 0,
        amount1000: (content.amount || 9.99) * 1000,
        currencyCodeIso4217: content.currency || 'USD',
        requestFrom: content.from || '0@s.whatsapp.net',
        noteMessage: {
            extendedTextMessage: {
                text: content.text || 'Example Payment Message'
            }
        },
        background: !!content.image ? (await makeBackgroundRequestPayment(content.image, {
            upload: this.sock.waUploadToServer
        })) : undefined
    }
    await this.sock.relayMessage(jid, { requestPaymentMessage }, { ...opts })
    return requestPaymentMessage
    
}

export const sendList = async function () {}
