import ws from "ws"
import * as uuid from "uuid"
import * as rl from "readline"

import { Events } from "./event"
const createQuestion = async function(question: string): Promise<string> {
    return new Promise((res, rej) => {
        const ifc = rl.createInterface(process.stdin, process.stdout)
        ifc.question(question, function (answer: string) {
            ifc.close()
            res(answer)
        })
    })
}

const cai: any = {
    events: new Events(),
    headers: {
        "Sec-Websocket-Extensions": "permessage-deflate; client_max_window_bits",
        "Sec-Websocket-Key": "guqSD3Kp1cYmOlOiA0A95Q==",
        "Sec-Websocket-Version": 13,
        Connection: "Upgrade",
        Host:  "neo.character.ai",
        Origin: "https://beta.character.ai",
        Upgrade: "websocket",
        "User-Agent": "okhttp/4.10.0",
        Cookie: 'GCLB="bf74a0f66c5866bb"; HTTP_AUTHORIZATION="Token 009943e371aadb032641d80610ab46d95ec956e7"; __cf_bm=bApQfyj7NYldlGFM8G1Uvy6EgM6p4FL4WYHKZhHwtkI-1692370727-0-AeBnhrxfnWZ9lirBGezQFu1EsUMMSJAQMLU3lF4up65XZgm/jmcVs8PKoto4M1Ie0z99PfPqQcoFwOh/Qb9T168='
      },
    history: {
        send: [],
        receive: []
    },
    author: {
        name: "Denta",
        is_human: true,
        author_id: "10609618"
    },
    character: {
        id: "O9WXqxGrj3sGnF6lTU_bsgpRsMmyNrOYw9J7sti-pBg"
    },
    chat: {
        id: "11538c6b-e874-44ea-a48e-8e373d4eaf12",
        history: []
    },
    origin: "web-118e8271f0bf59b9a5a080f5600310423372e698"
}

cai.sock = new ws("wss://neo.character.ai/ws/", { headers: cai.headers })
cai.sock.on("connect", () => {
    
})

cai.sock.on("message", (msg) => {
    cai.history.receive.push(msg)
    msg = msg+''
    if (typeof msg == 'string') {
        const jsong = JSON.parse(msg || "{}")
        if (jsong?.command == "update_turn" && jsong?.turn.candidates[0].is_final) {
            const content = { name: jsong?.turn.author.name, message: jsong?.turn.candidates[0].raw_content }

            cai.chat.history.push(content)
            cai.events.emit("reply.char", content)
        }
    }
})

cai.sendMessage = function(msg) {
    const command = "create_and_generate_turn"
    
    const request_id = uuid.v4()
    const turn_id = uuid.v4()
    const request = {
        command,
        request_id,
        payload: {
            num_candidates: 1,
            character_id: cai.character.id,
            turn: {
                turn_key: {
                    turn_id,
                    chat_id: cai.chat.id
                },
                author: cai.author,
                candidates: [{
                    candidate_id: turn_id,
                    raw_content: msg
                }],
                primary_candidate_id: turn_id
            }
        },
        origin_id: cai.origin
    }
    
    cai.sock.send(JSON.stringify(request))

    cai.history.send.push(JSON.stringify(request))
    cai.chat.history.push({
        name: cai.author.name,
        message: msg
    })
}

cai.getLastMessage = function() {
    return this.chat.history.reverse()[0]
}

async function sendMessage(): Promise<void> {
    return new Promise((res, rej) => {
        createQuestion(`${cai.author.name}: `).then((answer) => {
            cai.sendMessage(answer)
            res(void 0)
        })
    })
}

cai.events.on("reply.char", (content) => {
    console.log(`${content.name}: ${content.message}`)
    sendMessage()
})

console.log("CHARACTER AI")
console.log("Please make a message")
console.log()
sendMessage()