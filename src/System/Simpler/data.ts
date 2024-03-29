import * as fs from 'fs'
import * as path from 'path'

import { DataType, Text } from "../../Types"
import { Database } from '../database'

interface Admin {
    super: boolean;
    normal: boolean;
}

export function SimpleAdmin (uid, gid, database): Admin {
    database.load()
    const FixID = id => (((id).split(":")[0]+"@"+(id).split("@")[1]))
    const group = database.groups[gid]
    let superadmin: boolean = false;
    let normaladmin: boolean = false;
    
    if (group) {
        group.participants.forEach(({ id, admin }) => {
            if (FixID(uid) == FixID(id)) {
                if (admin == 'admin') normaladmin = true;
                if (admin == 'superadmin') superadmin = true
            }
        })
    }
    
    return {
        super: superadmin,
        normal: normaladmin
    }
}

export function SimpleData (chat: any, database): DataType  {
    const db = new Database(database.config.db.name)
    db.load()
    
    const data: DataType = {} as DataType
    //data['data'] = data
    data['chat'] = chat;
    data['message'] = chat.message
    data['quoted'] = chat.message.quoted()

    data['type'] = chat.message.type 
    data['from'] = chat.key.remoteJid
    
    data['on'] = {
        group: data.from.endsWith('@g.us'),
        private: data.from.endsWith('@s.whatsapp.net')
    }
    data['sender'] = data.on.group ? chat.key.participant : chat.key.remoteJid
    
    data['group'] = data.on.group ? (db.groups[data.from] || {}) : {}

    data['user'] = db.users[data.sender] || {}
    
    data['user']['is'] = {
        owner: false,
        admin: {
            super: false ,
            normal: false
        }
    }
    
    data['user']['is']['owner'] = data.sender.startsWith(database.config.owner.NoPhone)
    //data['user']['is']['coowner'] = data.sender.startsWith(config.coowner.NoPhone)
    data['user']['is']['admin'] = SimpleAdmin(data.sender, data.from, database)
    
    data['name'] = {
        user: "",
        group: ""
    }
    
    data['name']['user'] = data.user.profile?.name.contact || data.user.profile?.name.notify || data.chat.pushName || ""
    data['name']['group'] = data.group.subject || ""
    
    const text = data.chat.message['conversation'] ||
                 data.chat.message[data.chat.message.type]?.caption || 
                 data.chat.message['extendedTextMessage']?.text || ''
    data['text'] = {
        full: text,
        body: "",
        args: [],
        command: undefined
    }
    data['text']['args'] = text.trim().split(/ +/).slice(1)
    data['text']['body'] = text.trim().split(/ +/).slice(1).join(' ')
    data['text']['command'] = (text.startsWith(database.config.prefix) ? text.slice(1).trim().split(/ +/).shift().toLowerCase() : undefined)
    return data
}

