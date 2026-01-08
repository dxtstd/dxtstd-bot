import {
    Canvas, 
    Image, 
    CanvasRenderingContext2D, 
    loadImage,
    registerFont
} from "canvas"
import { CanvasEmoji } from "canvas-emoji"

import * as path from "path"
import * as fs from "fs"

interface OptsGenerateQuote {
    type: string;
    style: string;
    text: string;
    username: string;
    phone?: string;
    media?: {
        image: any;
        profile: any
    };
    quoted?: {
        type: string;
        username: string;
        phone?: string
        text: string;
    }
}

const cutText = function (text) {
   const maxLength = 37
   if (text.length <= maxLength) return text
   else return text.substr(0, maxLength)+"..."
}

const loadFont = function () {
    const fontsDir = path.resolve(process.cwd(), 'assets/font')
    fs.readdir(fontsDir, (_err, dirs) => {
        dirs.forEach(dir => {
            fs.readdir(`${fontsDir}/${dir}`, (__err, files) => {
                !!files ? files.forEach(file => {
                    try {
                        registerFont(`${fontsDir}/${dir}/${file}`, {
                            family: `${dir} ${file.split(".")[0]}`
                        })
                    } catch (err) {}
                }) : void 0
            })
        })
    })
}
loadFont()

const randomColor = function (style="white") {
    const white = [
        
    ]
    
    const dark = [
        
    ]
    
    
}

export class GenerateQuote {
    public canvas: any
    public ctx: CanvasRenderingContext2D
    
    private color = {
        background_chat: "#ffffff",
        username: "#aabbcc",
        quoted: "#1F1F1F"
    }
    
    public opts: OptsGenerateQuote
    
    style(type="white") {
        switch(type) {
            case "white": {
                
                break
            }
            case "dark": {
                
                break
            }
            default: {
                
            }
        }
    }
    
    constructor(opts: OptsGenerateQuote) {
        this.canvas = new Canvas(0, 0)
        this.ctx = this.canvas.getContext("2d")
        this.opts = opts
    }
    
    async profilePicture(media={}) {
        
    }
    
    drawWaveform() {
        
    }
    
    
    
    drawQuote(text="example", username="example", media={}, quoted={}) {
        interface sizeQuote {
            w: number,
            h: number
        }
        
        const DS: sizeQuote= {
            w: 100,
            h: 100
        }
        
        const MS: sizeQuote = {
            w: 750,
            h: 9999
        }
        
        const QS: sizeQuote & { x: number; y: number; r: number } = { w: DS.w, h: DS.h, x: 60, y: 20, r: 25 }
        

        const canvas = new Canvas(0, 0)
        const ctx = canvas.getContext("2d")
        
        let currentWidth = 0
        let hasMaxWidth = false
        let marginText = 50
        let currentLine = 0
        
        
        const wordss: any = []
        
        let words = []
        text.split(" ").forEach(word => {
            //word.split("\n").forEach(v => words.push(v))
            words.push(word)
        })
        
        const font = "30px \"Helvetica Regular\""
        ctx.font = font
        
        let usernameWidth = ctx.measureText(username).width
        
        function createLine (idx) {
            if (!wordss[idx]) {
                //console.log("create line")
                wordss[idx] = {
                    text: [],
                    line: idx,
                    x: 0,
                    y: 100 + (30 * idx)
                }
            }
        }
        
        createLine(0)
        let totalenter = 0
        text.split("\n").forEach(() => { totalenter++;createLine(totalenter) })
        for (const word of words) {
            const width = ctx.measureText(cutText(word)).width
            wordss[currentLine]?.text.push(cutText(word))
            if (hasMaxWidth) {
                if (currentWidth <= MS.w-marginText) {
                    currentWidth += width
                } else {
                    currentLine += 1
                    createLine(currentLine)
                    currentWidth = DS.w
                }
            } else {
                if (QS.w <= MS.w-marginText) {
                    QS.w = QS.w + width
                } else {
                    QS.w = MS.w
                    hasMaxWidth = true
                    currentLine += 1
                    createLine(currentLine)
                    currentWidth = DS.w
                }
            }
        }
        
        for(let i=0;i<currentLine;i++) {
            QS.h = QS.h + 30
        }
        
        QS.w = marginText + QS.w
        
        canvas.width = QS.w + QS.x + QS.r;
        canvas.height = QS.h + QS.y + QS.r;
        
        
        ctx.beginPath()
        ctx.fillStyle = this.color.background_chat
        
        ctx.moveTo(QS.x+QS.r, QS.y)
        ctx.lineTo(QS.x+QS.w-QS.r, QS.y)
        ctx.quadraticCurveTo(QS.x+QS.w, QS.y, QS.x+QS.w, QS.y+QS.r)
        ctx.lineTo(QS.x+QS.w, QS.y+QS.h-QS.r)
        ctx.quadraticCurveTo(QS.x+QS.w, QS.y+QS.h, QS.x+QS.w-QS.r, QS.y+QS.h)
        ctx.lineTo(QS.x+QS.r, QS.y+QS.h)
        ctx.quadraticCurveTo(QS.x, QS.y+QS.h, QS.x, QS.y+QS.h-QS.r)
        ctx.lineTo(QS.x, QS.y*3.5)
        ctx.quadraticCurveTo(QS.x, QS.y*3, QS.x-(QS.x*0.1), QS.y*3-((QS.y*3)*0.1))
        ctx.lineTo((QS.x-(QS.x*0.5)), QS.y+(QS.r*0.5))
        ctx.quadraticCurveTo((QS.x-(QS.x*0.9)), QS.y, (QS.x-(QS.x*0.5)), QS.y)
        ctx.lineTo(QS.x+QS.r, QS.y)
        
        ctx.fill()
        ctx.closePath()
        
        const canvasEmoji = new CanvasEmoji(ctx)
        
        return new Promise(async (resolve, reject) => {
            console.log(wordss)
            for (const word of wordss) {
                canvasEmoji.drawPngReplaceEmoji({
                    text: word?.text.join(" "),
                    fillStyle: "#000000",
                    x: 75,
                    y: word.y,
                    emojiW: 12,
                    emojiH: 12,
                    font
                })
            }
            resolve(canvas.toBuffer())
        })
    }
    
    async render() {
        return new Promise((resolve, reject) => {
            
            resolve(this.drawQuote(this.opts.text))
        })
    }
}
