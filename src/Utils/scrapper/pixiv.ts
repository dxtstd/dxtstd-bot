import axios from "axios";

const pixiv = axios.create({
    baseURL: "https://www.pixiv.net/",
    headers: {
        referer: "https://pixiv.net/"
    }
})

function total_page(illust: number): number {
    let page = 0;
    do {
        if (illust >= 60) {
            illust = illust - 60;
            page ++;
        } else if (illust != 0) {
            illust = illust - illust;
            page ++;
        } 
    } while (illust>=60||illust != 0);
    
    return page;
}

interface ResultPixivIllust {
    id: number;
    title: string;
    description: string;
    page: number;
    viewers: number;
    commented: number;
    like: number;
    tags: string[];
    date: {
        upload: string;
        create: string;
    }
    restrict: boolean;
    author: {
        name: string;
        id: string;
        account: string;
    };
    url: {
        mini: string;
        thumb: string;
        small: string;
        regular: string;
        original: string;
    }
}

export async function illustration(artwork: string|number): Promise<ResultPixivIllust> {
    const json: any = await pixiv.get(`/ajax/illust/${artwork}`)
                 .then(res => res.data)
    
    const data: ResultPixivIllust = {
        id: NaN,
        title: "",
        description: "",
        page: 0,
        viewers: 0,
        commented: 0,
        like: 0,
        tags: [],
        date: {
            upload: "",
            create: ""
        },
        restrict: false,
        author: {
            name: "",
            id: "",
            account: ""
        },
        url: {
            mini: "https://pixiv.net",
            thumb: "https://pixiv.net",
            small: "https://pixiv.net",
            regular: "https://pixiv.net",
            original: "https://pixiv.net"
        }
    }
    
    if (json.error) {
        throw new Error(json.message)
    }
    const body = json.body ?? {}
    data.id = body.id || data.id
    data.title = body.title || data.title
    data.description = body.description || data.description
    data.page = body.pageCount || data.page
    data.date = {
        upload: body.uploadDate || data.date.upload,
        create: body.createDate || data.date.create
    }
    data.restrict = Boolean(body.restrict) || Boolean(body.xRestrict)
    body?.tags?.tags.forEach(v => {
        data.tags.push(v.tag)
    })
    data.author = {
        name: body.userName || data.author.name,
        id: body.userId || data.author.id,
        account: body.userAccount || data.author.account
    }
    data.like = body.likeCount || data.like
    data.commented = body.commentCount || data.commented
    data.viewers = body.viewCount || data.viewers
    data.url = body.urls || data.url
    
    return data
};


interface ResultPixivSearch {
    keyword: string;
    totalIllust: number;
    totalPage: number;
    currentPage: number;
    data: Partial<ResultPixivIllust>[];
}

export async function search(keyword: string, page: number = 1): Promise<ResultPixivSearch> {
    const data: ResultPixivSearch = {
        keyword,
        totalIllust: 0,
        totalPage: 0,
        currentPage: page,
        data: []
    }
    
    const metadata = `${encodeURIComponent(keyword)}?word=${encodeURIComponent(keyword)}&order=date_d&mode=all&p=${page}&s_mode=s_tag&type=all&lang=jp`
    const json = await pixiv.get(("/ajax/search/illustrations/"+metadata)).then(res => res.data).catch(e => e.response.data)
    
    if (json.error) {
        throw new Error(json.message)
    }
    
    const body = json.body || {}
    
    if (!body.illust.total) {
        throw new Error("no search results!")
    }
    data.totalPage = total_page(body.illust.total)
    data.totalIllust = body.illust.total
    
    for (const illust of (body?.illust.data || [])) {
        const data_illust: Partial<ResultPixivIllust> = {
            id: NaN,
            title: "",
            description: "",
            page: 0,
            tags: [],
            date: {
                upload: "",
                create: ""
            },
            restrict: false,
            author: {
                name: "",
                id: "",
                account: ""
            }
        }
        
        data_illust.id = illust.id || data_illust.id
        data_illust.title = illust.title || data_illust.title
        data_illust.description = illust.description || data_illust.description
        data_illust.page = illust.pageCount || data_illust.page
        data_illust.date = {
            upload: illust.uploadDate || data_illust.date.upload,
            create: illust.createDate || data_illust.date.create
        }
        data_illust.restrict = Boolean(illust.restrict) || Boolean(illust.xRestrict)
        
        data_illust.author = {
            name: illust.userName || data_illust.author.name,
            id: illust.userId || data_illust.author.id,
            account: illust.userAccount || data_illust.author.account
        }
        
        
        data_illust.tags = illust.tags
        
        data.data.push(data_illust)
    }
    
    return data
};

export async function download(artwork: string|number, options: { proxy?: any }={}): Promise<any> {
    const json = await illustration(artwork);
    
    const result = await pixiv.get(json.url.original, {
        responseType: "arraybuffer"
    })
    
    return result.data
}
