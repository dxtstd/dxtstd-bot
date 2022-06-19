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

exports.NHentai = class Nhentai {
    constructor() {
        let headers = {
            headers: {
                DNT: 1,
                "Upgrade-Insecure-Requests": 1,
                cookie: "cf_clearance=I5z8FRd_NFTzA1gh6qPi4HW3fabUc8ZBzTC3VRXaqLw-1652648637-0-150; csrftoken=HyIwAET1ys9EtwZwjfyZiwFKecFwik6rTTcGkBxRtDBGUmgQLvNQZN9xFtfq3JdQ", 
                "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36"
            }
        }
        /*CHECK VALIDATID*/
        function testURL(URL) {
            return /https?:\/\/(www\.)?nhentai.net\/g\//.test(URL);
        }

        function testCodeNuke(CodeNuke) {
            return new RegExp(/[0-9]{1,6}/).test(CodeNuke);
        }
        
        const checkValid = async function checkValidNhentai(URL) {
            let error = false;
            try {
                let res = await fetcher.getWeb(URL, headers);
                if (res.status == '404') return error = "404 Not Found";
                if ((res.name || "").toLowerCase() == 'error') return error = res.stack;
                
                const _$ = cheerio.load(res);
                let notFound = _$('div.container');
                if (notFound[0]) {
                    if (notFound[0].attribs.class === 'container index-container') {
                        if (notFound[0].children[0].children[0].data === 'No results found') {
                            error = "No results found";
                        }
                    }
                }
            } catch (e) {
                error = e;
            } finally {
                return error;
            }
        };
        
        /*GET*/
        const getInfo = this.getInfo = async function getInfo(nuke = "") {
            let linkWeb;
            if (testURL(nuke)) linkWeb = nuke;
              else if (testCodeNuke(nuke)) linkWeb = 'https://nhentai.net/g/' + nuke;
                else throw new TypeError("Input is Not Valid! Must be URL Nhentai/Code Nuke (example: 177013)");
            
            const codeNuke = linkWeb.startsWith("http") ? (linkWeb.split(":")[0] == "https" ? linkWeb.replace("https://", "") : linkWeb.replace("http://", "")).replace("nhentai.net/g/", "").split("/")[0] : linkWeb 
            let fetchNF = await checkValid(linkWeb);
            if (fetchNF) throw new Error(fetchNF);

            const resultInfoNH = await fetcher.getJSON('https://nhentai.net/api/gallery/' + codeNuke, headers)
            
            resultInfoNH.artist = ""
            resultInfoNH.category = []
            resultInfoNH.character = []
            resultInfoNH.group = ""
            resultInfoNH.language = []
            resultInfoNH.parody = ""
            resultInfoNH.tag = []
            
            for (let i in resultInfoNH.tags) {
                let tags = resultInfoNH.tags[i]
                
                if (tags.type == 'artist') resultInfoNH.artist = tags.name
                if (tags.type == 'category') resultInfoNH.category.push(tags.name)
                if (tags.type == 'character') resultInfoNH.character.push(tags.name)
                if (tags.type == 'group') resultInfoNH.group = tags.name
                if (tags.type == 'language') resultInfoNH.language.push(tags.name)
                if (tags.type == 'parody') resultInfoNH.parody = tags.name
                if (tags.type == 'tag') resultInfoNH.tag.push(tags.name)
            }
            
            return resultInfoNH
        };
        
        const getBook = this.getBook = async function getBook(nuke) {
            const resultInfoNH = await getInfo(nuke);
            let arrayIMG = new Array();
            resultInfoNH.link = {}
            
            const bookIMG = resultInfoNH.images
            resultInfoNH.link.cover = `https://t.nhentai.net/galleries/${resultInfoNH.media_id}/cover.${(bookIMG.thumbnail.t == 'p' ? 'png' : 'jpg')}`
            
            let x = 1
            let i = 0
            while (x != bookIMG.pages.length) {
                arrayIMG.push(`https://i.nhentai.net/galleries/${resultInfoNH.media_id}/${x}.${(bookIMG.pages[i].t == 'p' ? 'png' : 'jpg')}`)
                x ++
                i ++
            }
            resultInfoNH.link.img = arrayIMG;
            return resultInfoNH;
        };
        
        /*SEARCH*/
        const search = {};
        search.keyword = async function (keyword, page = 1) {
            keyword = encodeURIComponent(keyword);
            let fetchNF = await checkValid('https://nhentai.net/search?q=' + keyword + "&page=" + page);
            if (fetchNF) throw new Error(fetchNF);
            let website = await fetcher.getWeb('https://nhentai.net/search?q=' + keyword + "&page=" + page, headers);

            let $ = cheerio.load(website);
            const scrapKNH = $('div.container.index-container');
            let OKScrapKNH = Object.keys(scrapKNH[0].children);
            let arrayKNH = new Array();
            
            for (var i in OKScrapKNH) {
                const scrapKNHL = scrapKNH[0].children[i].children[0].attribs.href;
                const scrapKNHI = await getInfo('https://nhentai.net' + scrapKNHL);
                arrayKNH.push(scrapKNHI);
            }
            return arrayKNH;
        };
        
        search.tag = async function (tag, page = 1) {
            tag = encodeURIComponent(tag.replace(/ /g, '-'));
            let fetchNF = await checkValid('https://nhentai.net/tag/' + tag + "/?page=" + page);
            if (fetchNF) throw new Error(fetchNF);
            let website = await fetcher.getWeb('https://nhentai.net/tag/' + tag + "/?page=" + page, headers);

            let $ = cheerio.load(website);
            const scrapTNH = $('div.container.index-container');
            let OKScrapTNH = Object.keys(scrapTNH[0].children);
            let arrayTNH = new Array();
            
            for (var i in OKScrapTNH) {
                const scrapTNHL = scrapTNH[0].children[i].children[0].attribs.href;
                const scrapTNHI = await getInfo('https://nhentai.net' + scrapTNHL);
                arrayTNH.push(scrapTNHI);
            }
            return arrayTNH;
        };
        
        search.char = async function (character, page = 1) {
            character = encodeURIComponent(character.replace(/ /g, '-'));
            let fetchNF = await checkValid('https://nhentai.net/character/' + character + "/?page=" + page);
            if (fetchNF) throw new Error(fetchNF);
            let website = await fetcher.getWeb('https://nhentai.net/character/' + character + "/?page=" + page, headers);

            let $ = cheerio.load(website);
            const scrapCNH = $('div.container.index-container');
            let OKScrapCNH = Object.keys(scrapCNH[0].children);
            let arrayCNH = new Array();
            
            for (var i in OKScrapCNH) {
                const scrapCNHL = scrapCNH[0].children[i].children[0].attribs.href;
                const scrapCNHI = await getInfo(scrapCNHL);
                arrayCNH.push(scrapCNHI);
            }
            return arrayCNH;
        };
        this.search = search;
        
        /*DOWNLOAD*/
        this.download = async function (nuke) {
            const resultNH = await getBook(nuke);
            
            function getSize (image, pdf) {
                let dimension = sizeOf(image);
                let width = pdf.internal.pageSize.getWidth();
                let height = pdf.internal.pageSize.getHeight();

                let widthRatio = width / dimension.width;
                let heightRatio = height / dimension.height;

                let ratio = widthRatio > heightRatio ? heightRatio : widthRatio;
                return {
                   width: dimension.width * ratio, 
                   height: dimension.height * ratio 
                };
            }
            
            let pdf = new jsPDF();
            let coverNH = await fetcher.getBuffer(resultNH.link.cover, headers);
            pdf.addImage(coverNH, 0, 0, getSize(coverNH, pdf).width, getSize(coverNH, pdf).height);
            
            for (var i in resultNH.link.img) {
                const IMGNH = await fetcher.getBuffer(resultNH.link.img[i], headers);
                
                pdf.addPage();
                pdf.addImage(IMGNH, 0, 0, getSize(IMGNH, pdf).width, getSize(IMGNH, pdf).height);
            }
            
            pdf.addPage();
            let WMNH = await fs.readFileSync(path.join(__dirname, '../assets/WMNH.png'));
            pdf.addImage(WMNH, 0, 0, getSize(WMNH, pdf).width, getSize(WMNH, pdf).height);
            let hasil = await pdf.output('arraybuffer');
            return new Buffer.from(hasil);
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