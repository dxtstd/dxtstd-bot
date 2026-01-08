import axios from 'axios'
import * as cheerio from 'cheerio'
import * as mimetype from 'mime-types'
import { JSDOM } from 'jsdom'

export async function zippy(URL): Promise<{
    uploaded: string,
    file: {
        url: string;
        name: string;
        mimetype: string;
        size: string|number;
    }
}> {
    const { data } = await axios.get(URL);
    const $ = cheerio.load(data);
    const getMainURL = function (url) {
        return (url.split('http')[1].split('/')[2]);
    };
    const { document } = (new JSDOM(data)).window
    
    const searchScript = function (): string[] {
        const scripts: any = document.getElementsByTagName("script");
        const filteredScript: string[] = []
        for (let i=0;i<=(scripts.length-1);i++) {
            const script = scripts.item(i)
            if (script.innerHTML.includes('document.getElementById(\'dlbutton\')')) {
                filteredScript.push(script.innerHTML) 
            }
        }
        
        return [
            filteredScript[2],
            filteredScript[0],
            filteredScript[1]
       ]
    }
    
    const LINK: { download: string; image: string; } = {
        download: "",
        image: ""
    }
    //console.dir(searchScript())
    eval(searchScript().join("\n").replace(/document.getElementById\(\'dlbutton\'\)\.href \= \"d\/123\/asd.xml\"/, ""))
    
    eval(
        `LINK.download = document.getElementById('dlbutton')?.href
        LINK.image = document.getElementById('fimage')?.href`
    )
    
    
    const fileurl = ('https://' + getMainURL(URL) + LINK.download)
    const filename = (($("#lrbox > div:nth-child(2) > div:nth-child(1) > font:nth-child(4)").text()) || decodeURIComponent(LINK.download.split('/').reverse()[0]))
    const filesize = (await (fetch(
        fileurl,
        { method: 'HEAD' }
    ).then(({ headers }) => {
        return (Number(headers.get("content-length")) / 1000).toFixed(2)
    })))
    
    //Output
    return {
        uploaded: ($("#lrbox > div:nth-child(2) > div:nth-child(1) > font:nth-child(10)").text()) || 'kapan-kapan',
        file: {
            url: fileurl,
            name: filename,
            mimetype: (mimetype.lookup(filename) as string),
            size: filesize,
            [Symbol('size.unit')]: "kiloByte"
        },
        [Symbol('scrapper.author')]: "DentaCH"
    };
}
