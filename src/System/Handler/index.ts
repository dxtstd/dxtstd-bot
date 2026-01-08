//export * from 'button'
//export * from 'command'

//export * as group from 'group'
import * as message from './message'
import * as user from './user'
import * as group from './group'
import * as command from './command'
import * as anti from './anti'

const HANDLER = [
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

export function setHandler(bot) {
    //ANTI
    Object.keys(anti).forEach(type => {
        bot.events.on(('anti.%type%'.replace('%type%', type)), (m) => { 
            anti[type].handler(bot, m)
        })
    })
    
    //COMMAND
    bot.events.on('command.button.respond', (m) => {
        command.button.respond(bot, m)
    })
        
    bot.events.on('command.text', (m) => {
        command.text(bot, m)
    })
    
    bot.events.on('command.execute', (m, exe) => {
        command.execute(bot, m, exe)
    })
    
    //CONTACT
    bot.events.on('contact.update', (contact) => {
        user.updateData(bot, contact)
    })
    
    //GROUP
    bot.events.on('group.participant.update', (arg) => {
        console.log(arg)
        group.participantUpdate(bot, arg)
    })
    bot.events.on('group.metadata.update', (arg) => {
        console.log(arg)
    })
    
    
    //MESSAGE
    bot.events.on('message.receive', (m) => {
        message.receive(bot, m)
    })
    
}  
