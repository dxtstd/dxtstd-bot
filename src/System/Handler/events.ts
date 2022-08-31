import { ReceiverMessageHandler, GroupParticipantHandler, ContactsHandler } from './'
import { startClient } from '../client'
import { logger } from '../../Utils'

import { Boom } from '@hapi/boom'

export async function EventsHandler (client, database, opts: object={}) {
    const { ev, ws } = client;
    
    ev.on('creds.update', (creds) => {
        //console.log(creds)
        database.load()
        database.auth = client.authState
        database.save()
    })
    
    ev.on('group-participants.update', (group) => {
        GroupParticipantHandler(group, client, database)
    })
    
    ev.on('messages.upsert', (chat) => {
        ReceiverMessageHandler(chat, client, database)
    })
    
    ev.on('contacts.update', (contact) => {
        ContactsHandler(contact, database)
    })
}