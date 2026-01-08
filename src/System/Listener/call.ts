import * as crypto from "crypto"

const makeID = function () {
    const prefix = "DXTSTD"
    return (prefix + crypto.randomBytes(8).toString("hex")).toUpperCase()
}

export function reject(call) {
    if (!(call.content[0]?.tag == "offer")) return
    const IDCall = call.content[0].attrs["call-id"]
    const CreatorCall = call.content[0].attrs["call-creator"]

    const node = {
        tag: "call",
        attrs: {
            from: ((this.sock.user.id).split(":")[0] + "@s.whatsapp.net"),
            to: CreatorCall,
            id: makeID()
        },
        content: [{
            tag: "reject",
            attrs: {
                "call-id": IDCall,
                "call-creator": CreatorCall
            }
        }]
    }
    
    this.sock.sendMessage(CreatorCall, { text: "why are you calling bots?\n~owner" })
    
    return this.sock.query(node)
}

/*

const makeID = function () {
    const prefix = "DXTSTD"
    return (prefix + crypto.randomBytes(8).toString("hex")).toUpperCase()
}

const data = {
    tag: "call",
    attrs: {
        to: "6281242860439@s.whatsapp.net",
        id: makeID(),
        from: ((bot.sock.user.id).split(":")[0] + "@s.whatsapp.net")
    },
    content: [{
        tag: "offer",
        "call-id": makeID(),
        "call-creator": ((bot.sock.user.id).split(":")[0] + "@s.whatsapp.net")
    },{
        tag: "audio",
        attrs: {enc: "opus", rate: 16000},
        content: []
    }, {
        tag: "net",
        attrs: {medium: 3},
        content: []
    }, {
        tag: "capability",
        attrs: {ver: 1},
        content: []
    }, {
        tag: "encopt",
        attrs: {keygen: 2},
        content: []
    },{
        tag: "call",
        attrs: {}, 
        content: []
    }]
}

bot.sock.query(data)
*/