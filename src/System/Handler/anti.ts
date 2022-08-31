import { GROUP } from '../../Defaults'

const ExampleVirtexSymbol = [
    "๒๒๒๒๒๒๒๒",
    "๑๑๑๑๑๑๑๑",
    "৭৭৭৭৭৭৭৭",
    "ผิดุท้่เึางืผิดุท้่เึางื",
    "𝙼𝙰𝚍𝚃𝙾𝙽𝚓𝙾𝙻",
    "1⃣•9⃣•4⃣•5⃣•",
    "777777",
    "999999",
    "666666",
    "111111"
]

interface VirtexDetected {
    level: string;
    detected: boolean;
    symbol: {
        total: number;
        contains: string[];
    };
    tag: {
        total: number;
        contains: string[];
    };
    total: number
}

const DetectVirtex = function (message): VirtexDetected {
    //if virtex contain symbol
    let ContainsSymbol: string[] = []
    let SymbolDetected: boolean = false
    let CountSymbol: number = 0
    ExampleVirtexSymbol.forEach(sybvirtex => {
        if (message.includes(sybvirtex)) {
            ContainsSymbol.push(sybvirtex)
            message.split("\n").forEach(piece => {
                piece.split(/ +/).forEach(word => {
                    word = (word.replace(/~/g, '')).replace(/_/g, '').replace(/ +/g, '').replace(/\+/g, '').replace(/-/g, '').replace(/\*/g, '')
                    
                    if (word.length > sybvirtex.length) {
                        word = word.match(eval(`/.{${Math.floor(sybvirtex.length)}}/g`))
                        //console.log(word)
                        if (!word) return
                        word.forEach(piece => {
                            if (!SymbolDetected && CountSymbol > 50) SymbolDetected =     true
                            if (word.includes(sybvirtex)) {
                                CountSymbol ++
                            }
                        })
                    } else {
                        if (word.includes(sybvirtex)) {
                            if (!SymbolDetected && CountSymbol > 50) SymbolDetected =     true
                            CountSymbol ++
                        }
                    }
                })
            })
        }
    })
    
    //if virtex contain tag
    let ContainsTag: string[] = []
    let TagDetected: boolean = false
    let CountTag: number = 0
    if (message.includes('@')) {
        message.split("\n").forEach(piece => {
            piece.split(/ +/).forEach(word => {
                word = ((((word.replace(/~/g, '')).replace(/_/g, '')).replace(/ +/g, '')).replace(/\+/g, '')).replace(/-/g, '')
                
                if ((word.includes('*') && word.includes('@')) && (/@[0-9]/).test(word.replace(/\*/g))) {
                    if (!TagDetected && CountTag > 50) TagDetected = true
                    CountTag ++
                    const taken = ContainsTag.filter(v => word == v)[0] ? true : false;
                    if (!taken) {
                        ContainsTag.push(word)
                    }
                }
            })
        })
    }
    
    
    
    //Level Virtex
    const LevelVirtex: string[] = ["no effect", "soft", "medium", "hard", "extremely"]
    let level: number = 0
    
    const CountTotal = Math.floor(CountSymbol + CountTag)
    if (CountTotal > 49) {
        level = 1
    }
    if (CountTotal > 199) {
        level = 2
    } 
    if (CountTotal > 499) {
        level = 3
    }
    if (CountTotal > 999) {
        level = 4
    }
    
    return {
        level: LevelVirtex[level],
        detected: SymbolDetected || TagDetected,
        symbol: {
            total: CountSymbol,
            contains: ContainsSymbol
        },
        tag: {
            total: CountTag,
            contains: ContainsTag
        },
        total: CountTotal
    }
}

const TEXT = {
    header: `*[ ANTI %choice% ]*`,
    body: `%info%`,
    footer: `_you have violated, as a punishment you will be kicked from this group, sorry..._`
}

const AntiHandler = async (chat, client, { data, database }) => {
    database.load()
    if (!data.on.group) return

    const group = database.groups[data.from] || GROUP
    const { config } = group
    if (config.anti.virtex) {
        const result = DetectVirtex(data.text.full)
        if (result.detected) {
            let text = TEXT.header + '\n\n' + TEXT.body + '\n\n' + TEXT.footer
            const information = `> Level Virtex: ${result.level}`
            text = text.replace('%choice%', 'VIRTEX').replace('%info%', information)
            
            client.sendMessage(data.from, { text }, { quoted: data.chat }).then(v => {
                client.groupParticipantsUpdate(data.from, [data.sender], "remove")
            })
        }
    }
}

export {
    AntiHandler
}