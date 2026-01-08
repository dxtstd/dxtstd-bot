import {
    createCanvas,
    Canvas,
    loadImage,
    registerFont
} from "canvas";
import { Image } from "canvas";
import { createH264MP4Encoder } from "h264-mp4-encoder";
import { fromPng } from "@rgba-image/png";

import * as fs from "fs";
import * as fsp from "fs/promises"
import * as path from "path";

const setting: {
    resolution: {
        width: number,
        height: number
    },
    fps: number,
    duration: {
        time: number,
        frame: number
    }
} = {
    resolution: {
        width: 360*4,
        height: 360
    },
    fps: 60,
    duration: {
        time: 5,
        frame: 0
    }
}

var h = setting.resolution.height/2
var w = setting.resolution.width
var f=1

function calcSineY(x) {
	// This is the meat (unles you are vegan)
    // Note that:
    // h is the amplitude of the wave
    // x is the current x value we get every time interval
    // 2 * PI is the length of one cycle (full circumference)
    // f/w is the frequency fraction
	return h - h * Math.sin( x * 2 * Math.PI * (f/w) );
}

const comp: any = {
    "Comp 1": {
        duration: {
            time: 5,
            frame: 30
        }
    }
}

const object: any = {
    "bundal": {
        duration: {
            time: 2,
            frame: 30
        }
    }
}

async function countTime(fps, duration) {
    const times: any = []
    const temp: any = {
        duration: {
            time: 0,
            frame: 0
        }
    }

    while (temp.duration.time <= duration.time && !(temp.duration.time >= duration.time && (temp.duration.frame <= duration.frame && temp.duration.frame != 30))) {
        console.log("while 1")
        times[temp.duration.time] = [];
        let frame = 0
        while (frame < fps) {
            console.log(`${temp.duration.time}:${temp.duration.frame}`)
            times[temp.duration.time][frame] = parseInt((parseFloat((((frame+1)/fps) * (1)).toFixed(2)) * 100).toFixed(2))
            frame = temp.duration.frame = frame+1
        }
        frame = temp.duration.frame = 0
        temp.duration.time = temp.duration.time+1
    }
    const ms = []
    let total_frame = 0
    for (let i in times) {
        for (let ii in times[i]) {
            ms[total_frame.toString()] = Math.abs((times[i][parseInt(ii)+1] || (times[i][parseInt(ii)-1])) - times[i][ii])
            total_frame++
        }
    }

    
    return {
        ms: ms.map(v => v * 10).filter(v => !!v)
    }
}

async function captureFrame(fps, duration) {
    
}
const canvas = new Canvas(setting.resolution.width, setting.resolution.height)
const ctx = canvas.getContext("2d")
ctx.fillStyle = "rgb(255, 255, 255)";
ctx.fillRect(0, 0, setting.resolution.width, setting.resolution.height);

function drawSine(x){
  ctx.clearRect(0, 0, w, h*2);
  //draw x axis
  ctx.beginPath(); // Draw a new path
  ctx.strokeStyle = "green"; // Pick a color
  ctx.moveTo(0,h); // Where to start drawing
  ctx.lineTo(w,h); // Where to draw to
  ctx.stroke(); // Draw
  
  // draw horizontal line of current amplitude
  ctx.beginPath(); // Draw a new path
  ctx.moveTo(0,h); // Where to start drawing
  ctx.strokeStyle = "gray"; // Pick a color
  for(var i=0;i<x;i++){ // Loop from left side to current x
    var y = calcSineY(x); // Calculate y value from x
  	ctx.moveTo(i,y); // Where to start drawing
    ctx.lineTo(x,y); // Where to draw to
  }
  ctx.stroke(); // Draw
  
  // draw amplitude bar at current point
  ctx.beginPath(); // Draw a new path
  ctx.strokeStyle = "red"; // Pick a color
  for(var i=0;i<x;i++){ // Loop from left side to current x
    var y = calcSineY(x); // Calculate y value from x
  	ctx.moveTo(x,h); // Where to start drawing
    ctx.lineTo(x,y); // Where to draw to
  }
  ctx.stroke(); // Draw
  
  // draw area below y
  ctx.beginPath(); // Draw a new path
  ctx.strokeStyle = "orange"; // Pick a color
  for(var i=0;i<x;i++){ // Loop from left side to current x
    if(i/3==Math.round(i/3)) { // Draw only one line each 3 pixels
      var y = calcSineY(i); // Calculate y value from x
      ctx.moveTo(i,h); // Where to start drawing
      ctx.lineTo(i,y); // Where to draw to
    }
  }
  ctx.stroke(); // Draw
  
  // draw sin curve point to point until x
  ctx.beginPath(); // Draw a new path
  ctx.strokeStyle = "black"; // Pick a color
  for(var i=0;i<x;i++){ // Loop from left side to current x
    var y = calcSineY(i); // Calculate y value from x
    ctx.lineTo(i,y); // Where to draw to
  }
  ctx.stroke(); // Draw
}

async function makeCacheFrame(data, count_frame): Promise<string> {
    const pathfile = path.join(__dirname, "frames")
    //fs.existsSync(pathfile) ? (await fsp.mkdir(pathfile)) : void 0
    
    const filename = path.join(pathfile, `frame_${count_frame}.png`)
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, data, () => {
            console.log("saving... ", filename)
            resolve(filename)
        })
    })
}

async function deleteCache () {
    const pathfile = path.join(__dirname, "frames")
    fs.rmSync(pathfile, { recursive: true, force: true })
}

function prepareEncoder(): void {
    this.encoder = {}
}

prepareEncoder.prototype.create = async function () {
    await createH264MP4Encoder().then((encoder) => {
        this.encoder = encoder

        encoder.width = setting.resolution.width
        encoder.height = setting.resolution.height
        encoder.frameRate = setting.fps
        encoder.initialize();
    })
}

prepareEncoder.prototype.addFrameRgba = function (ctx: CanvasRenderingContext2D) {
    this.encoder.addFrameRgba(ctx.getImageData(0, 0, setting.resolution.width, setting.resolution.height).data)
}

prepareEncoder.prototype.run = function () {
    this.encoder.finalize()
    const datax = this.encoder.FS.readFile(this.encoder.outputFilename)
    this.encoder.delete()

    fs.writeFileSync("test.mp4", datax)
}

const has_render_frame: string[] = []
countTime(setting.fps, setting.duration).then(async (res) => {
    let times = 0
    let timess: number[] = []
    const encoder = new prepareEncoder()
    await encoder.create()
    
    for (var i in res.ms) {
        times = times+res.ms[i]
        timess.push(times/1000)

        drawSine(times/1000 * setting.resolution.width/setting.duration.time)
        encoder.addFrameRgba(ctx)
        
        console.log(res.ms[i])
        console.log(times/1000)
    }

    encoder.run()
})