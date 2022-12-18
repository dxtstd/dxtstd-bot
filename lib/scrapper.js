const axios = require('axios')
const fetcher = require('./fetcher.js');
const cheerio = require('cheerio');
const { jsPDF }= require('jspdf');
const sizeOf = require('image-size');
const fs = require('fs');
const path = require('path');

const axiosOption = {
    
};

exports.wallpaper = async function wallpaper(keyword) {
    let website = await fetcher.getWeb('https://wall.alphacoders.com/search.php?search=' + encodeURIComponent(keyword));

    var $ = cheerio.load(website);
    const scrapWP = $("span");
    let arrayScrapWP = [];
    scrapWP.each((v) => {
        if (scrapWP[v].attribs.title === "Download Wallpaper") {
            let scrapWPL = `https:\/\/initiate.alphacoders.com\/download\/wallpaper\/${scrapWP[v].attribs["data-id"]}\/${scrapWP[v].attribs["data-server"]}\/${scrapWP[v].attribs["data-type"]}\/`;
            
            const objectWP = {
                title: "",
                url: scrapWPL
            };
            
            arrayScrapWP.push(objectWP);
        }
    });
    for (var i in arrayScrapWP) {
        let scrapWPT = $("img.img-responsive")[i];
        arrayScrapWP[i].title = scrapWPT.attribs.alt ? scrapWPT.attribs.alt : keyword;
    }
    return arrayScrapWP;
};

exports.pixiv = class pixiv {
    constructor() {
        this.illust = async function illust(nuke) {
            let hasil = await fetcher.getWeb(`https://www.pixiv.net/ajax/illust/${nuke}`)
            return hasil
        }
        
        this.search = async function search(keyword) {
            let hasil = await fetcher.getWeb(`https://www.pixiv.net/ajax/search/illustrations/${encodeURIComponent(keyword)}?word${encodeURIComponent(keyword)}&order=date_d&mode=all&p=1&s_mode=s_tag&type=all&lang=en`)
            
            if (!hasil.body.illust) hasil.error = true;
            
            return hasil
        }
    }
}

exports.AlphaCoders = class AlphaCoders {
    constructor() {
        const checkValid = async function checkValidAlphaCoders() {
            
        };
        
        this.wallpaper = async function wallpaper(keyword) {
            
        };
        
        this.avatar = async function avatar(keyword) {
            
        };
    }
};


exports.Pinterest = class Pinterest {
    constructor() {
        const checkValid = async function getValidPinterest (URL) {
            
        };
        
        const fetchHTML2InfoJSON = async function fetchHTML2InfoJSON (HTML) {
            const resultScrapP = {};
            var $ = cheerio.load(HTML);
            let arrayLinkIMGP = $('head').children('link');
            
            //TITLE
            resultScrapP.title = $('title').text() || '';
            
            //LINK
            resultScrapP.link = {};
            resultScrapP.link.image = ''
            arrayLinkIMGP.each((v) => {
                if (arrayLinkIMGP[v].attribs.rel === 'preload') return resultScrapP.link.image = arrayLinkIMGP[v].attribs.href;
            });
            
            return resultScrapP
        };
        
        const fetchJSON2InfoJSONArray = async function fetchJSON2InfoJSONArray (json) {
            const resultArrayP = []
            const dataJSON = json.resource_response.data.results
            
            for (let i in dataJSON) {
                const tmpInfoJSONP = {}
                if (dataJSON[i].id && dataJSON[i].rich_summary) {
                    tmpInfoJSONP.title = dataJSON[i].rich_summary.display_name || dataJSON[i].grid_title || dataJSON[i].title
                    
                    tmpInfoJSONP.description = dataJSON[i].rich_summary.display_description  || dataJSON[i].grid_description || dataJSON[i].description 
                    
                    tmpInfoJSONP.link = {}
                    tmpInfoJSONP.link.image = dataJSON[i].images.orig.url || dataJSON[i].images['736x'].url || dataJSON[i].images['474x'].url || dataJSON[i].images['236x'].url || dataJSON[i].images['160x160'].url || dataJSON[i].images['170x'].url || undefined
                    tmpInfoJSONP.link.post = "https://www.pinterest.com/pin/" + (dataJSON[i].id);
                    
                    resultArrayP.push(tmpInfoJSONP)
                } else {}
            }
            
            if (resultArrayP.length == 0) {
                resultArrayP.push({
                    title: "Keyword not found",
                    description: "Because your keyword isn't valid",
                    link: {
                        image: "https://i.pinimg.com/736x/1e/83/ae/1e83aeddbaaa8f3bbe8c491e29a5bdda.jpg",
                        post: "https://id.pinterest.com/pin/609111918329402544/"
                    }
                })
            }
            
            return resultArrayP
        }
        
        this.getInfo = async function getInfo(URL) {
            const website = await fetcher.getWeb(URL);
            let resultInfoP = await fetchHTML2InfoJSON(website)
            resultInfoP.link.post = URL
            return resultInfoP
        };
        
        this.search = async function search(keyword) {
            const optionSearchP = {
                options: {
                    page_size: 50,
                    query: keyword,
                    scope: 'pins',
                    bookmarks: [],
                    field_set_key: 'unauth_react',
                    no_fetch_context_on_resource: false
                },
                context: {}
            }
            
            const JSONSearchP = await fetcher.getWeb(`https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=/search/pins/?q=${encodeURIComponent(keyword)}&rs=typed&term_meta[]=${encodeURIComponent(keyword)}%7Ctyped&data=${encodeURIComponent(JSON.stringify(optionSearchP))}`)
           
           const resultSearchP = await fetchJSON2InfoJSONArray(JSONSearchP)
           return resultSearchP
        };
    }
};

/*
exports.Anime = class Anime {
    constructor() {
        const top = this.top = async function () {
            let hasil = []
            const website = await fetcher.getWeb("https://myanimelist.net/topanime.php?type=bypopularity")
let $ = cheerio.load(website)
let content  = $(".ranking-list")
content.each((a, b ) =>{
let getHtml = $(b)
let judul = getHtml.find("div.di-ib.clearfix").text()
let rank = hasil.length + 1
let score = getHtml.find("td.score.ac.fs14" ).text().split("\n")[0]
let information = getHtml.find("div.information.di-ib.mt4").text().split("\n").map(p => p.trim())
while (information.indexOf('') !== -1) { 
information.splice(information.indexOf(''), 1)
}
hasil.push({judul, rank, score, information})
})
        }
    }
}
*/
