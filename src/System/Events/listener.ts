import logger_default from "../../Utils/logger"
const logger = logger_default.child({ class: "dxtstd-bot", system: "event.listener" })

import * as handler from "../Handlers"
import { Bot } from "../init"

function socket(this: Bot) {
    this.sock.ev.on('messages.update', (arg) => {
        logger.debug(arg)
    })

    this.sock.ev.on('messages.upsert', handler.message.sock.listener.bind(this))
    
    /*
    bot.sock.ev.on('creds.update', () => {
        bot.database.load()
        bot.database.auth = bot.sock.authState
        bot.database.save()
    })
    */

    // Event WebSocket
    //this.sock.ws.on('CB:call', call.reject.bind(this))
}

const EVENTS_BOT = [
    'command.button.respond', //when the button is pressed
    'command.button.create', //when the button is created by a bot
    'command.text', //when someone uses command prefix 
    'command.execute', //to execute commands from button and text
    'contact.update',
    'group.participant.update', //when a group member changes
    'group.metadata.update', //when group schange
    'message.delete', //when a message is deleted
    'message.receive' //receive message
];
function bot(this: Bot) {
    /*
    //ANTI
    Object.keys(anti).forEach(type => {
        this.events.on(('anti.%type%'.replace('%type%', type)), (m) => { 
            anti[type].handler(bot, m)
        })
    })
    
    //COMMAND
    this.events.on('command.button.respond', (m) => {
        command.button.respond(bot, m)
    })
        
    this.events.on('command.text', (m) => {
        command.text(bot, m)
    })
    
    this.events.on('command.execute', (m, exe) => {
        command.execute(bot, m, exe)
    })
    
    
    
    //GROUP
   
    
    */
   //GROUP
    this.event.on('group.participant.update', (arg) => {
        //logger.debug(arg)
        handler.group.participantUpdate.bind(this)(arg)
    })
    this.event.on('group.metadata.update', (arg) => {
        logger.debug(arg)
    })

    //CONTACT
    this.event.on('contact.update', () => {
        
    })

    //MESSAGE
    this.event.on('message.receive', handler.message.bot.listener.bind(this))
}

export const set = {
    bot, socket
}