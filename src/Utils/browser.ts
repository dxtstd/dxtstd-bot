import * as puppeteer from 'puppeteer';

const isUrl = function (url) {
     return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'));
};

const opts = {
    args: ['--no-sandbox']
};

const launch = async function () {
    return await puppeteer.launch(opts);
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