const utils = require("../../Utils");
const { Canvas, loadImage, registerFont } = require("canvas")
const path = require("path")
registerFont(path.join(__dirname, '../../../', 'assets', 'font', 'Montserrat', 'Montserrat.ttf'), {
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

const createCanvas = async function ({background_image, pp_image}) {
    const size = {
        width: 720*1.5,
        height: 320*1.5
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
        cbsa[2]*2, // w
        cbsa[3]*2 // h
    ]
    
    border.drawImage(cbg, ...cbgda, ...cbgda)
    
    let gradientBg = border.createLinearGradient(0, 0, 500, 0)
    gradientBg.addColorStop(0, "rgba(0, 120, 255, 0.35)")
    gradientBg.addColorStop(1, "rgba(0, 200, 255, 0.35)")
    border.fillStyle = gradientBg
    border.fillRect(...cbgda)

    border.lineWidth = cbs
    border.strokeStyle = "#ffffff"
    border.beginPath()
    border.moveTo(cbsa[0], cbsa[1])
    border.lineTo(cbsa[2], cbsa[1])
    border.lineTo(cbsa[2], cbsa[3])
    border.lineTo(cbsa[0], cbsa[3])
    border.lineTo(cbsa[0], cbsa[1]-8)
    border.stroke();

    main.drawImage(cb, 0, 0)

    const ct = new Canvas(cmw, cmh);
    const text = ct.getContext("2d")
    text.font = "50px Italic \"Montserrat Regular\"";
    text.fillStyle = "#ffffff";
    text.fillText("Welcome To root@refadenbil", 100, 100);
    main.drawImage(ct, 0, 0)

    const cpp = new Canvas(512, 512)
    const pp = cpp.getContext("2d")
    pp.drawImage(pp_image, 0,0, cpp.width, cpp.height)
    pp.globalCompositeOperation="destination-in"
    pp.beginPath()
    pp.arc(cpp.width/2, cpp.height/2,cpp.height/2,0,Math.PI*2)
    pp.closePath();
    pp.fill()
    pp.drawImage()
    
    //main.drawImage(cpp, cmw*0.08, cmh*0.25, cpp.width*0.7, cpp.height*0.7)
    
    main.drawImage(cpp, cmw*0.1, cmh*0.3, cpp.width*0.5, cpp.height*0.5)
    
    void main.reply({ image: canvas.toBuffer('image/png') })
}

getImage("wallpaper sucrose")
.then(image => loadImage(image))
.then(background_image => {
    return utils.fetcher.getBuffer("https://pps.whatsapp.net/v/t61.24694-24/321203336_160998770042104_7998776992369263541_n.jpg?ccb=11-4&oh=01_AdRGnAylSaLDfjtN6xwW27PggPv3OCa-eXEus6Qdhu3jfg&oe=63E5A90B")
    .then(image => loadImage(image))
    .then(pp_image => {
        return createCanvas({
            background_image,
            pp_image
        })
    })
})