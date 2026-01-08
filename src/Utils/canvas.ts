const utils = require("../../Utils");
const { createCanvas ,Canvas, Image, loadImage, registerFont } = require("canvas")
//const GIFEncoder = require('gifencoder')
const HME = require("h264-mp4-encoder")
const fs = require("fs")
const path = require("path")

const pathFont = path.join(__dirname, '../../../', 'assets', 'font', 'Montserrat')

registerFont(path.join(pathFont, 'Italic.ttf'), {
  family: "Montserrat Italic"
})
registerFont(path.join(pathFont, 'Regular.ttf'), {
    family: "Montserrat Regular"
})


const getImage = async function (keyword="sucrose") {
    return new Promise((resolve, reject) => {
        (new (utils.scrapper.pinterest.Pinterest))
        .search
        .keyword(keyword)
        .then(({ result }) => {
            const pin = result[Math.floor(Math.random() * result.length)]

           utils.fetcher.getBuffer(pin.link.image)
           .then(buff => resolve(buff))
        })
    })
}

const fitImage = function (canvas_size, image_size) {
    let x = 0,
        y = 0,
        width = 0, 
        height = 0;

    var hRatio = canvas_size.width  / image_size.width    ;
    var vRatio =  canvas_size.height / image_size.height;

    let ratio = Math.max ( hRatio, vRatio );
    x = +((canvas_size.width - image_size.width*ratio) / 2).toFixed(2);
    y = +((canvas_size.height - image_size.height*ratio) / 2).toFixed(2);
    width = +(image_size.width*ratio).toFixed(2)
    height = +(image_size.height*ratio).toFixed(2)

    return [x, y, width, height]
}

const centerImage = function (canvas_size, image_size) {
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

const createWelcome = async function ({background_image, pp_image}) {
    const size = {
        width: 720*1.5,
        height:320*1.5
    }
    
    //canvas width & height
    const cmw = size.width || 720
    const cmh = size.height || 320
    
    //canvas border size & ratio
    const cbs = 15
    const cbr = 0.050

    const cm = new Canvas(cmw, cmh)
    const main = cm.getContext("2d")
    
    const cbg = new Canvas(cmw, cmh) 
    const bg = cbg.getContext("2d")

    main.fillStyle = "rgba(0, 0, 0, 0.6)"
    
    bg.drawImage(background_image, ...fitImage(cm, background_image));
    main.drawImage(cbg, 0, 0)
    main.fillRect(0, 0, cmw, cmh)

    const cb = new Canvas(cmw, cmh)
    const border = cb.getContext("2d")
    
    const cbxr = cmw*cbr
    const cbyr = cmh*cbr
    
    //canvas border stroke args
    
    const cbsa = [
        cbxr, // x
        cbyr,// y
        (cmw - cbxr), // w
        (cmh - cbyr) // h
    ]
    
    //canvas background draw args
    const cbgda = [
        cbsa[0], // x
        cbsa[1],// y
        cmw - cbxr*2, // w
        cmh - cbyr*2 // h
    ]
    
    //m.reply({ text: JSON.stringify([cbsa, cbgda]) })
    border.beginPath()
    border.drawImage(cbg, ...cbgda, ...cbgda)
    //border.blur(3)
    //border.filter = ""
    border.closePath()
    
    let gradientBg = border.createLinearGradient(0, 0, 500, 0)
    gradientBg.addColorStop(0, "rgba(0, 120, 255, 0.35)")
    gradientBg.addColorStop(1, "rgba(0, 200, 255, 0.35)")
    border.fillStyle = gradientBg
    border.fillRect(...cbgda)

    border.lineWidth = cbs
    border.strokeStyle = "#ffffff"
    border.beginPath()

    border.roundRect(...cbgda, 10)
    border.stroke();

    main.drawImage(cb, 0, 0)

    const ct = new Canvas(cmw, cmh);
    const text = ct.getContext("2d")
    text.shadowColor = "#000000"
    text.shadowBlur = "20px"
    text.font = "55px \"Montserrat Italic\"";
    text.fillStyle = "#ffffff";
    text.fillText("Welcome To", cmw*0.3, cmh*0.25);
    text.fillText("this group", cmw*0.4, cmh*0.35);

    text.font = "60px \"Montserrat Regular\""
    text.fillText("DedenCH", cmw*0.5, cmh*0.5);
    text.strokeText()

    main.drawImage(ct, 0, 0)
    
    const cpp = new Canvas(363, 363)
    const pp = cpp.getContext("2d")
    
    pp.drawImage(pp_image, 0,0, cpp.width, cpp.height)
    pp.globalCompositeOperation="destination-in"
    pp.beginPath()
    pp.arc(cpp.width/2, cpp.height/2,cpp.height/2,0,Math.PI*2)
    pp.closePath();
    pp.fill()
    
    const pathAssetsFire = path.join(process.cwd(), 'assets/api')
    const assetsFire = fs.readdirSync(pathAssetsFire)
    
    
    let nganu;
    let encoder = HME.createH264MP4Encoder().then(encoder => {
        encoder.width = cmw
        encoder.height = cmh
        encoder.frameRate = 12 
        encoder.initialize();
        
        for (let fireFile of assetsFire) {
            const cg = new Canvas(cmw, cmh)
            const gctx = cg.getContext("2d")
            nganu = gctx
        
            gctx.drawImage(cm, 0, 0)
        
            const cppwf = new Canvas(512, 512)
            const ppwf = cppwf.getContext("2d")
    
            const fire = new Image()
            fire.src = path.join(pathAssetsFire, fireFile)
    
            const cv1 = centerImage(cppwf, cpp)
            const cv2 = centerImage(cpp, cppwf)
    
            ppwf.drawImage(cpp, Math.floor(cppwf.width*0.145), Math.floor(cppwf.height*0.145), cpp.width, cpp.height)
   
            ppwf.drawImage(fire, 0, 0, cppwf.width, cppwf.height)
    
            gctx.drawImage(cppwf, cmw*0.05, cmh*0.20, cppwf.width*0.6, cppwf.height*0.6)
        
            encoder.addFrameRgba(gctx.getImageData(0, 0, cmw, cmh).data)
        }
    
    
    
        encoder.finalize()
        const datax = encoder.FS.readFile(encoder.outputFilename)
        
        encoder.delete()
        
        m.reply({ video: Buffer.from(datax), mimetype: "video/mp4", gifPlayback: true })
    }).catch(reject)
}

getImage("wallpaper sucrose")
.then(image => loadImage(image))
.then(background_image => {
    return utils.fetcher.getBuffer("https://pps.whatsapp.net/v/t61.24694-24/373698167_1352280259055427_2927029302003373200_n.jpg?ccb=11-4&oh=01_AdRNIrcx4fHTmS-kEWD35HOj9mCtMPiG_O60ziDsooTbng&oe=6555C171&_nc_sid=e6ed6c&_nc_cat=102")
    .then(image => loadImage(image))
    .then(pp_image => {
        return createWelcome({
            background_image,
            pp_image
        })
    })
})
