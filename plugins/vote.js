//PUT YOUR MODULE IN HERE ↓↓↓
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

    const pathVote = path.join(__dirname, '..', '/database/', 'vote.json')
    const voting = JSON.parse(fs.readFileSync(pathVote))

    try {
        const teks = (judul, agree, reject, voters) => {
            tejs = `*VOTING*`
            + '\n' + `Title: ${judul}`
            + '\n'
            + '\n' + `Yang Setuju: ${agree} Orang`
            + '\n' + `Yang Menolak: ${reject} Orang`
            + '\n'
            + '\n' + `Yang Telah Vote: `
            + '\n' + `${voters}`

            return tejs
        }

        if (!from.includes('@g.us')) return reply('only groups')

        let groups = false
        for (i in voting) {
            if (voting[i] != undefined) {
                if (voting[i].groups === from) {
                    groups = i
                }
            }
        }

        if (args.length > 0 && args[0].toLowerCase() == 'start') {
            if (voting[groups] != undefined) {
                if (voting[groups].groups == from) {
                    return reply('Vote Telah Dibuat Di grup ini')
                }
            }
            voter = {
                groups: from,
                title: args.join(' ').replace('start', ''),
                agree: 0,
                reject: 0,
                voters: [],
                startVote: sender
            }
            voting.push(voter)
            fs.writeFileSync(pathVote, JSON.stringify(voting))
            reply('Vote Telah Berhasil Dibuat')
            client.sendMessage(from, teks(args.join(' ').replace('start', ''), 0, 0, []), MessageType.text)
            return
        }

        if (voting[groups] == undefined) {
            return reply(`ketik "${prefix}vote start [nama]" untuk memulai voting`)
        }

        if (args.length > 0 && args[0].toLowerCase() == 'end') {
            if (voting[groups] != undefined) {
                if (voting[groups].startVote != sender || sender.split("@")[0] != owner) {
                    return reply('Hanya orang yang memulai vote atau admin dapat mengakhiri vote ini')
                }
            }
            reply('Vote untuk yang di grup ini ditutup!')
            voting.splice(groups, 1)
            fs.writeFileSync(pathVote, JSON.stringify(voting))
            return
        }

        let doneVote = false
        if (voting[groups] != undefined) {
            for (i in voting[groups].voters) {
                if (voting[groups].voters[i] == username) {
                    doneVote = true
                }
            }
        }

        if (args.length > 0 && args[0].toLowerCase() == 'hasil') {
            reply(teks(voting[groups].title, voting[groups].agree, voting[groups].reject, voting[groups].voters))
            return
        }
        if (args.length > 0 && args[0] != undefined) {
            /*Agree*/ if (args[0].toLowerCase() == 'setuju' || args[0].toLowerCase() == 'agree') {
                if (doneVote) return reply('Kamu Telah Vote!')
                voting[groups].agree += 1
                voting[groups].voters.push(username)
                fs.writeFileSync(pathVote, JSON.stringify(voting))
                reply(teks(voting[groups].title, voting[groups].agree, voting[groups].reject, voting[groups].voters))
                return
            } /*Reject*/ else if (args[0].toLowerCase() == 'tolak' || args[0].toLowerCase() == 'reject') {
                if (doneVote) return reply('Kamu Telah Vote!')
                voting[groups].reject += 1
                voting[groups].voters.push(username)
                fs.writeFileSync(pathVote, JSON.stringify(voting))
                reply(teks(voting[groups].title, voting[groups].agree, voting[groups].reject, voting[groups].voters))
                return
            }
        } else {
            if (doneVote) return reply('Kamu Telah Vote!')
            reply('Pilihlah salah satu (SETUJU/TOLAK)')
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

handler.tag = `utility`
handler.command = [`vote`]

module.exports = handler