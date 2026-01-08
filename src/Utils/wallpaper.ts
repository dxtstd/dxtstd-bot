import axios from 'axios'
import * as cheerio from 'cheerio'

interface IWallpaper {
    title: string;
    url: string;
}

export async function wallpaper(keyword): Promise<{
    result: IWallpaper[]
}> {
    let { data } = await axios.get('https://wall.alphacoders.com/search.php?search=' + encodeURIComponent(keyword));

    var $ = cheerio.load(data);
    const scrapWP = $("span");
    let arrayScrapWP: IWallpaper[] = [];
    scrapWP.each((v) => {
        if (scrapWP[v].attribs.title === "Download Wallpaper") {
            let scrapWPL = `https:\/\/initiate.alphacoders.com\/download\/wallpaper\/${scrapWP[v].attribs["data-id"]}\/${scrapWP[v].attribs["data-server"]}\/${scrapWP[v].attribs["data-type"]}\/`;
            
            const objectWP: IWallpaper = {
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
    
    return {
        result: arrayScrapWP,
        [Symbol('scrapper.author')]: 'DentaCH'
    };
};