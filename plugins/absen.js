//PUT YOUR MODULE IN HERE ↓↓↓
const util = require('util')
const path = require('path')
const fs = require('fs')

const handler = async () => {
    const data = global.db.data

    const chat = data.chat
    const from = data.from
    const text = data.text
    const command = data.command
    const args = data.args
    const groupname = data.groupname
    const username = data.username
    const sender = data.sender

    const reply = (teks) => {
        client.sendMessage(from, teks, MessageType.text, {
            quoted: chat
        })
    }

    const pathAbsen = path.join(__dirname, '..', '/database/', 'absen.json')
    const absen = JSON.parse(fs.readFileSync(pathAbsen))

    try {
        const teks = (title, people, status) => {
            
            let datax = ""
            var number = 1
            
            for (i in people) {
                datax += `${number}. ${people[i]} | ${status[i]}\n`
                number ++
            }
            
            tejs = '*ABSENSI*'
            + "\n" + `Title: ${title}`
            + "\n" + `Total Orang Ter Absensi: ${people.length}`
            + "\n"
            + "\n" + `${datax}`
            
            return tejs
        }
        
        let groups = false
        for (i in absen) {
            if (absen[i] != undefined) {
                groups = i
            }
        }
        
        if (args.length > 0 && args[0].toLowerCase() == 'start') {
            if (absen[groups] != undefined) {
                if (absen[groups].groups == from) {
                    return reply('Absen Telah Dibuat Di grup ini')
                }
            }
            absensi = {
                groups: from,
                title: args.join(' ').replace('start', ''),
                people: [],
                status: [],
                nomorWa: [],
                startAbsen: sender
            }
            absen.push(absensi)
            fs.writeFileSync(pathAbsen, JSON.stringify(absen))
            reply('Absen Telah Di Buat!')
            client.sendMessage(from, teks(args.join(' ').replace('start', ''), [], []), MessageType.text)
            return
        }
        
        if (absen[groups] == undefined) {
            return reply(`ketik "${prefix}absen start [judul absen] untuk memulai absensi`)
        }
        
        if (args.length > 0 && args[0].toLowerCase() == 'end') {
            if (absen[groups] != undefined) {
                if (absen[groups].startAbsen != sender) {
                    return reply('Hanya orang yang memulai absen atau admin dapat mengakhiri absen ini')
                }
            }
            reply('Absen untuk yang di grup ini ditutup!')
            absen.splice(groups, 1)
            fs.writeFileSync(pathAbsen, JSON.stringify(absen))
            return
        }
        
        let doneAbsen = false
        if (absen[groups] != undefined) {
            for (i in absen[groups].people) {
                if (absen[groups].people[i] == username) {
                    doneAbsen = true
                }
            }
        }
        
        if (args.length > 0 && args[0].toLowerCase() == 'hasil') {
            reply(teks(absen[groups].title, absen[groups].people, absen[groups].status))
            return
        }
        
        if (args.length > 0 && args[0].toLowerCase() == 'cancel') {
            let users
            for (i in absen[groups].people) {
                if (absen[groups].people[i] == username) {
                    users = i
                }
            }
            
            if (users == undefined) {
                reply('kamu belum absen')
                return
            }
            
            absen[groups].people.splice(users, 1)
            absen[groups].status.splice(users, 1)
            fs.writeFileSync(pathAbsen, JSON.stringify(absen))
            reply(teks(absen[groups].title, absen[groups].people, absen[groups].status))
            return
        }
        
        if (doneAbsen) return reply('Kamu Sudah Absen')
        
        if (args.length > 0 && args[0] != undefined) {
            absen[groups].people.push(username)
            absen[groups].status.push(args.join(' '))
            fs.writeFileSync(pathAbsen, JSON.stringify(absen))
            reply(teks(absen[groups].title, absen[groups].people, absen[groups].status))
        } else {
            reply('Isinya mana?')
            return
        }
        
    } catch (e) {
        reply(`ERROR: ${util.format(e)}`)
        logger.error(e)
    }
}

handler.disable = false

handler.help = false
if (handler.help) {
    handler.title = ''
    handler.description = ''
    handler.usage = ''
}

handler.owner = false
handler.private = false
handler.admin = false
handler.group = true

handler.tag = 'utility'
handler.command = [`absen`]

module.exports = handler