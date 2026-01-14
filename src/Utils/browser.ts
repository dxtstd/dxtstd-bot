import * as puppeteer from 'puppeteer';
import * as fs from "fs"

const isUrl = function (url) {
     return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'));
};

const bin = [
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable"
]
const selectBinaryBrowser = function () {
    return bin
           .map(pathbin => fs.existsSync(pathbin) ? pathbin : void 0)
           .filter(v => v)
           [0]
}

const DEF_OPTS = {
    args: ['--no-sandbox'],
    executablePath: selectBinaryBrowser()
};

const launch = async function (opts={}) {
    return puppeteer.launch({...DEF_OPTS, ...opts});
};

const ssweb = async function (url: string) {
    const browser = await launch();
    try {
        url = url.startsWith('http') ? url : 'http://' + url;
        if (!isUrl(url)) throw new Error();
        
        const page = await browser.newPage();
        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
        });
        await page.goto(url);
        
        const result = await page.screenshot()
        browser.close();
        return result;
    } catch (error) {
        browser.close();
        throw error;
    }
};

export {
    launch,
    ssweb
}