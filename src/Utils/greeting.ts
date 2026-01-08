import * as Jimp from 'jimp'
import * as moment from 'moment-timezone'

import * as fs from 'fs'
import * as path from 'path'

import * as fetcher from './fetcher'

const AssetsPath = path.resolve(__dirname, '../..', 'assets')
const ImagePath = path.resolve(AssetsPath, 'group', 'greeting')
const FontPath = path.resolve(AssetsPath, 'font')

const ImageRandom = function () {
    const Files = fs.readdirSync(ImagePath)
    return path.resolve(ImagePath, Files[(Math.floor(Math.random() * Files.length))])
}

interface FormatGreeting {
    url: {
        pp?: string;
    };
    text: {
        name: {
            user: string;
            group: string;
        };
        rank?: string;
        time: string;
        wm?: string;
    };
}

/**
* Greeting card for new members join
*
* @param {FormatGreeting} opts - contains the text to be written
*
*
*/
const join = async function GreetingJoinMember (opts: FormatGreeting) {
    const {
        text,
        url
    } = opts

    const MidFont = await Jimp.loadFont(`${FontPath}/Montserrat-Mid.ttf.fnt`)
    const font = {
        big: undefined,
        mid: MidFont,
        small: undefined
    }

    const image = await Jimp.read(ImageRandom())

    const PPRaw = (url.pp) ? await fetcher.getBuffer(url.pp, {}) : await fs.readFileSync(
        path.resolve(__dirname, '../..', 'assets', 'blank.png')
    )
    const PP = await Jimp.read(PPRaw)
    PP.resize(200, 200)

    const PrintMidText = function (x, y, text) {
        image.print(font.mid, x, y, {
            text: text
        }, 5000, 500)
    }

    if (text.wm) PrintMidText(0, 0, text.wm)
    PrintMidText(205, 425, 'Welcome to')
    PrintMidText(240, 480, text.name.group)

    //User
    PrintMidText(320, 560, (text.name.user + (text.rank ? (" | " + text.rank): "")))

    //Time
    PrintMidText(400, 650, text.time)

    image.blit(PP, 0, 340)
    await image.resize(Math.floor(1270*0.8), Math.floor(720*0.8))

    return await image.getBufferAsync('image/png')
}

/**
* Greeting card for old member left
*
* @param {FormatGreeting} opts - contains the text to be written
*
*
*/
const leave = async function GreetingLeaveMember (opts: FormatGreeting) {
    const {
        text,
        url
    } = opts

    const MidFont = await Jimp.loadFont(`${FontPath}/Montserrat-Mid.ttf.fnt`)
    const font = {
        big: undefined,
        mid: MidFont,
        small: undefined
    }

    const image = await Jimp.read(ImageRandom())

    const PPRaw = (url.pp) ? await fetcher.getBuffer(url.pp, {}) : await fs.readFileSync(
        path.resolve(__dirname, '../..', 'assets', 'blank.png')
    )
    const PP = await Jimp.read(PPRaw)
    PP.resize(200, 200)

    const PrintMidText = function (x, y, text) {
        image.print(font.mid, x, y, {
            text: text
        }, 5000, 500)
    }

    if (text.wm) PrintMidText(0, 0, text.wm)
    PrintMidText(205, 425, 'Goodbye from')
    PrintMidText(240, 480, text.name.group)

    //User
    PrintMidText(320, 560, text.name.user + (text.rank ? (" | " + text.rank): ""))

    //Time
    PrintMidText(400, 650, text.time)

    image.blit(PP, 0, 340)
    await image.resize(Math.floor(1270*0.8), Math.floor(720*0.8))

    return await image.getBufferAsync('image/png')
}

/*
const a = {
    wm: 'dxtstd-bot',
    username: 'DentaCH',
    groupname: 'C A P E K  D I S A T I R I N',
    rank: '1st members',
    time: moment.tz('Asia/Makassar').format('hh:mmA dddd, DD MMMM Y'),
    pp: 'https://pps.whatsapp.net/v/t61.24694-24/289026503_745838156773244_6564532162280969784_n.jpg?ccb=11-4&oh=34bc8934b060929bce8fce4a40e409ff&oe=62BEC92C'
}
*/

export {
    join,
    leave
}