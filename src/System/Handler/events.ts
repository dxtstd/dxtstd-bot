import { ReceiverMessageHandler, ContactsHandler } from './'
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
    
    ev.on('messages.upsert', (chat) => {
        ReceiverMessageHandler(chat, client, database)
    })
    
    ev.on('contacts.update', (contact) => {
        ContactsHandler(contact, database)
    })
    
    ev.on('connection.update', (update) => {
        if (update.qr) logger.info('Scan this QR!')
        if (update.connection == 'connecting') logger.info('Connecting to WhatsApp Web...')
    
        if (update.connection == 'close') {
            const statusCode = (update.lastDisconnect?.error as Boom)?.output?.statusCode
            if (statusCode != 401) {
                startClient(opts)
            }
        }
    })
}