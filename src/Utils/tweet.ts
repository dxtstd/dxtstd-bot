import * as bwsr from "./browser"

export async function tweet(uri) {
    return new Promise((resolve, reject) => {
        bwsr.launch()
        .then(browser => {
            browser.newPage()
            .then(page => {
                page.setViewport({
                    height: 1920, width: 1080
                })
                .then(() => page.setDefaultNavigationTimeout(0))
                .then(() => page.goto(uri, { waitUntil: 'load' }))
                .then(() => page.waitForSelector("article[role=\"article\"]", { visible: true, timeout: 0 }))
                .then(() => page.$("article[role=\"article\"]"))
                .then(element => {
                    element.screenshot()
                    .then(buffer => {
                        browser.close()
                        .then(() => resolve(buffer))
                    })
                })
            })
            .catch(reject)
        })
        .catch(reject)
    })
}
