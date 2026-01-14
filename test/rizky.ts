import { Canvas, Image, registerFont } from "canvas"

import * as fs from "fs"
import * as path from "path"

registerFont("./code_b.ttf", {
  family: "Code Bold"
})
registerFont("./code_l.ttf", {
  family: "Code Light"
})
registerFont("./monoid.ttf", {
  family: "Monoid"
})



const centerImage = function (canvas_size: Canvas, image_size: Canvas) {
  let x = 0,
      y = 0,
      width = 0, 
      height = 0;

  var hRatio = canvas_size.width  / image_size.width    ;
  var vRatio =  canvas_size.height / image_size.height;

  let ratio = Math.min ( hRatio, vRatio );
  x = +((canvas_size.width - image_size.width*ratio) / 2).toFixed(2);
  y = +((canvas_size.height - image_size.height*ratio) / 2).toFixed(2);
  width = +(image_size.width*ratio).toFixed(2)
  height = +(image_size.height*ratio).toFixed(2)

  return [x, y, width, height]
}

function hexToRGBA (hex: string) {
  const splitHex: string[] = (hex.replace(/\#/g, "")).match(/.{1,2}/g) || ["FF", "FF", "FF", "FF"]
  const [RED, GREEN, BLUE, ALPHA]: string[] = [splitHex[0]||"00", splitHex[1]||"00", splitHex[2]||"00", (splitHex[3]||"FF")]

  const result = [eval(`0x${RED}`), eval(`0x${GREEN}`), eval(`0x${BLUE}`), eval(`(0x${ALPHA} / 255).toFixed(1)`)]

  return `rgba(${result[0]}, ${result[1]}, ${result[2]}, ${result[3]})`
} 

const size = {
  w: 1280,
  h: 720
}

const smc = {
  w: size.w || 720,
  h: size.h || 480
}

const mc = new Canvas(smc.w, smc.h)
const m_ctx = mc.getContext("2d")

m_ctx.fillStyle = hexToRGBA("#2b293a")
m_ctx.fillRect(0, 0, smc.w, smc.h)

let drcb = 0.060
let dscb = 15

const bc = new Canvas(smc.w, smc.h)
const b_ctx = bc.getContext("2d")

const rcb = {
  x: Math.floor(smc.w*drcb*0.75),
  y: Math.floor(smc.h*drcb*2.25)
}

const cbgda: number[] = [
  rcb.x, // x
  rcb.y,// y
  (smc.w - rcb.x*2), // w
  (smc.h - rcb.y*2) // h
]

b_ctx.fillStyle = hexToRGBA("#292838")
b_ctx.lineWidth = dscb
b_ctx.roundRect(cbgda[0], cbgda[1], cbgda[2], cbgda[3], 25)

//shadow
b_ctx.shadowColor = hexToRGBA("#000000ff")
b_ctx.shadowBlur = 100
b_ctx.shadowOffsetX = 0;
b_ctx.shadowOffsetY = 0;

b_ctx.fill()
m_ctx.drawImage(bc, 0, 0)

const ppc = new Canvas(Math.floor(mc.height*0.5), Math.floor(mc.height*0.5))
const pp_ctx = ppc.getContext("2d")

const pp_image = new Image()
pp_image.src = path.join(process.cwd(), "pp.jpg")


pp_ctx.beginPath()
pp_ctx.drawImage((pp_image), 0, 0, ppc.width, ppc.height)
pp_ctx.globalCompositeOperation = "destination-in"
pp_ctx.beginPath()
pp_ctx.arc(Math.floor(ppc.width/2), Math.floor(ppc.height/2), Math.floor(ppc.height/2), 0 , Math.PI * 2)
pp_ctx.closePath();
pp_ctx.closePath()
pp_ctx.fill();


const ppec = new Canvas(Math.floor(mc.height*0.7), Math.floor(mc.height*0.7))
const ppe_ctx = ppec.getContext("2d")

ppe_ctx.shadowColor = hexToRGBA("#1ED91E90")
ppe_ctx.shadowBlur = 45
ppe_ctx.shadowOffsetX = 0;
ppe_ctx.shadowOffsetY = 0;
//ppe_ctx.fill()

ppe_ctx.beginPath();
ppe_ctx.arc(Math.floor(ppec.width*0.482), Math.floor(ppec.height*0.482), Math.floor(ppec.width*0.375), 0, 2 * Math.PI);
ppe_ctx.fillStyle = hexToRGBA("#1FD91E")
ppe_ctx.fill()
ppe_ctx.beginPath()
ppe_ctx.drawImage(ppc, Math.floor(ppec.width*0.5*0.5*0.5), Math.floor(ppec.height*0.5*0.5*0.5), ppc.width, ppc.height)
ppe_ctx.beginPath()
ppe_ctx.arc(Math.floor(ppec.width*0.5*0.5*0.90), Math.floor(ppec.height*0.5*0.5*0.75), Math.floor(ppec.width*0.06), 0, 2 * Math.PI);
ppe_ctx.fill()
ppe_ctx.closePath()

const cc = new Canvas(mc.width*0.15, mc.height*0.1) 
const c_ctx = cc.getContext("2d")
c_ctx.beginPath()
c_ctx.fillStyle = hexToRGBA("#F87857") 
c_ctx.arc(Math.floor(cc.width*0.245), Math.floor(cc.height*0.5), Math.floor(cc.width >= cc.height ? cc.width*0.065 : cc.height*0.20), 0, 2 * Math.PI)
c_ctx.fill()
c_ctx.beginPath()
c_ctx.fillStyle = hexToRGBA("#5857FA")
c_ctx.arc(Math.floor(cc.width*0.50), Math.floor(cc.height*0.5), Math.floor(cc.width >= cc.height ? cc.width*0.065 : cc.height*0.20), 0, 2 * Math.PI)
c_ctx.fill()
c_ctx.beginPath()
c_ctx.fillStyle = hexToRGBA("#26CE27")
c_ctx.arc(Math.floor(cc.width*0.765), Math.floor(cc.height*0.5), Math.floor(cc.width >= cc.height ? cc.width*0.065 : cc.height*0.20), 0, 2 * Math.PI)
c_ctx.fill()

const tc = new Canvas(cbgda[2], cbgda[3])
const t_ctx = tc.getContext("2d")
t_ctx.font = "35px \"Code Bold\""
t_ctx.fillStyle = "#ffffff"
const texto = "CANVAS.IN"
t_ctx.fillText(texto, Math.floor((tc.width*0.5)-((t_ctx.measureText(texto).width)*0.5)), (mc.height-(rcb.y*2))*0.155)

const subject = JSON.stringify({
  name: "dxtstd",
  id: "6281242860439@s.whatsapp.net",
  message: "Welcome! to @subject"
}, null, '  ')
t_ctx.font = "30px Monoid"
t_ctx.fillText(subject, Math.floor((tc.width*0.5)-((t_ctx.measureText(texto).width)*0.8)), (mc.height-(rcb.y*2))*0.45)


m_ctx.drawImage(tc, cbgda[0], cbgda[1])
m_ctx.drawImage(cc, (mc.width-(rcb.x*2))*0.075 , (mc.height-(rcb.y*2))*0.25)
m_ctx.drawImage(ppec, Math.floor(mc.width*0.1*0.6), Math.floor(mc.height*0.5*0.6), Math.floor(ppc.width*1.2), Math.floor(ppc.height*1.2))

fs.writeFile("./image.png", Buffer.from((mc.toDataURL('image/png')).split(",")[1], "base64"), { }, () => { console.log("done") })