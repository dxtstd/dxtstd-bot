import cheerio from "cheerio";
import { GetWeb } from "./fetch";
import * as m3u8Parser from 'm3u8-parser'

const HTML2JSON = async function HTML2JSON(html: string) {
    const ResultJSON = {};
    const $ = cheerio.load(html);
};

interface IMetadataPost {
    title: string;
    description: string;
    author: {
        name: ''
    }
    link: {
        image: string|null;
        video: string|null;
        post: string;
    }
}

const linkplm3u8tovidm3u8 = async function (link): Promise<string> {
    const manifest = await GetWeb(link)

    var parser = new m3u8Parser.Parser();
    parser.push(manifest)
    parser.end()
    
    return link.split('/').reverse().splice(1).reverse().concat((parser.manifest?.playlists[0].uri || '')).join('/')
}

const JSON2ARRAY = async function JSON2ARRAY(json: any): Promise<IMetadataPost[]> {
    const ResultArray: IMetadataPost[] = [];
    const ArrayDataJSON = json?.resource_response?.data?.results || [];
    console.log(json.resource_response)
    const fetchMetadata: any = []
    
    ArrayDataJSON.splice(1).forEach(async (data: any) => {
        const metadata: IMetadataPost = {
            title: '',
            description: '',
            author: {
                name: ''
            },
            link: {
                image: null,
                video: null,
                post: ''
            }
        }
        
        metadata.title = (data.title || data.rich_summary?.display_name || data.grid_title || 'TITLE')
        metadata.description = (data.description || data.rich_summary?.description || data.grid_description || 'DESCRIPTION')
        
        metadata.link.image = (!!data.images ? 
        (
            data?.images[
                (Object.keys(data?.images||{}).reverse())[0]
            ]?.url 
        ) : null)
        
        metadata.link.video = (!!data.videos ?
        (await 
            linkplm3u8tovidm3u8(
                data.videos.video_list[
                    (Object.keys(data.videos.video_list||{}))[0]
                ]?.url
            )
        ) : null);
        metadata.link.post = "https://pinterest.com/pin/" + data.id
          
        metadata.author.name = (data.pinner?.username || data.pinner?.full_name)
        
        ResultArray.push(metadata)
    })
    
    return ResultArray
};

export {
    HTML2JSON,
    JSON2ARRAY,
    IMetadataPost
};