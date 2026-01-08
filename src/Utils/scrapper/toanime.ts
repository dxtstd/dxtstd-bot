import axios from 'axios';
import * as uuid from 'uuid';
import * as crypto from 'crypto'
import HPA from 'https-proxy-agent'

import * as Jimp from 'jimp'

const TIMEOUT_PROXY = 5000
const RETRY_COUNT = 5

const proxys = [
    { host: "39.105.105.240", port: "60080"}, //SLOW RESPON
    { host: '112.80.83.130', port: '8118' },
    { host: '111.225.152.55', port: '8089' },
    { host: '61.178.141.146', port: '80' },
    { host: '112.87.140.163', port: '9443' },
    { host: '39.105.122.19', port: '60080' },
    { host: '39.105.132.17', port: '60080' },
    { host: '182.92.161.220', port: '60080' },
    { host: '111.225.153.44', port: '8089' },
    { host: '47.98.219.185', port: '8999' },
    { host: '111.225.153.24', port: '8089' },
    { host: '219.148.43.102', port: '3128' },
    { host: '116.62.200.109', port: '20005' },
    { host: '159.27.27.189', port: '9999' },
    { host: '221.225.81.91', port: '3128' },
    { host: '101.6.65.75', port: '10080' },
    { host: '39.105.122.64', port: '60080' },
    { host: '39.105.98.204', port: '60080' },
    { host: '183.172.49.251', port: '4780' },
    { host: '8.141.251.188', port: '3128' },
    { host: '182.149.117.87', port: '7890' },
    { host: '183.172.201.232', port: '7891' },
    { host: '39.99.148.89', port: '8080' },
    { host: '118.31.2.38', port: '8999' },
    { host: '183.172.235.68', port: '4780' },
    { host: '101.200.227.223', port: '60080' },
    { host: '39.107.234.215', port: '60080' },
    { host: '112.87.140.164', port: '9443' },
    { host: '123.56.250.62', port: '60080' }
]

export async function searchProxy(timeout=TIMEOUT_PROXY) {
    const result = []
    const tasks = []
    
    proxys.forEach(proxy => {
        tasks.push((async function () {
            return (new Promise(
            (resolve, reject) => {
                const httpsAgent = HPA(proxy)
                setTimeout(resolve, (timeout))
                axios.get("https://ifconfig.me/", { httpsAgent }).then(res => resolve(proxy)).catch(err => resolve(void 0))
            })).then(result_proxy => !!result_proxy ? result.push(result_proxy) : void 0)
        })())
    })
    
    await Promise.all(tasks)
    //if (result.length == 0) return searchProxy(timeout+TIMEOUT_PROXY)
    return result
}

export async function draw(input, options={}): Promise<{
    code: number;
    results: string[];
}> {
    const metadata: any = {
        images: [input.toString('base64')],
        busiId: "ai_painting_anime_img_entry",
        extra: JSON.stringify({
            face_rects: [],
            version: 2,
            platform: 'web',
            data_report: {
                parent_trace_id: uuid.v4(),
                root_channel: '',
                level: 0
            }
        })
    }
     
    const url = new URL('https://ai.tu.qq.com/trpc.shadow_cv.ai_processor_cgi.AIProcessorCgi/Process');
    const urlHash = `${url.origin}${JSON.stringify(metadata).length}HQ31X02e`;
    const sign = crypto.createHash('md5').update(urlHash).digest('hex');
    const headers = {
      'Host': url.host,
      'x-sign-value': sign,
      'x-sign-version': 'v1',
      'user-agent': 'okhttp/3.12.13',
      'Origin': url.origin,
      'Referer': 'https://ai.tu.qq.com/'
    };
    
    
    const { data } = await axios({
        url: url.href,
        method: "POST",
        data: metadata,
        headers,
        ...options
    }).catch(error => {
        throw error.stack
    })
    
    if (data.code != 0) throw new Error(JSON.stringify(data, null, '\t'));
    
    return {
        code: data.code,
        results: (JSON.parse(data.extra))['img_urls']
    }
};

export async function draw_proxyed(
    input, 
    opts: { timeout?: number }={}
) {
    return searchProxy(opts.timeout||TIMEOUT_PROXY).then(result_proxys => {
        const proxy = result_proxys[Math.floor(Math.random() * result_proxys.length)]
        //console.log(result_proxys)
        if (result_proxys.length == 0) return draw_proxyed(input, {
            timeout: opts.timeout+TIMEOUT_PROXY
        })
        
        const httpsAgent = HPA(proxy)
        return draw(input, { httpsAgent })
    })
}

export async function crop(input) {
    const img = await Jimp.read(input)
    
    const { height, width } = img.bitmap
  
    if (height > width) img.crop(20, 575, 720, 450)
    else if (height < width) img.crop(520, 25, 450, 700)
    
    return await img.getBufferAsync('image/jpeg')
}