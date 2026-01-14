import axios from "axios"

const lf = axios.create({
    baseURL: "https://lyrics.lyricfind.com/"
})

export async function lyrics (song) {
    const params = {
        reqtype: "default",
        territory: "ID",
        searchtype: "track",
        all: song||"rick astley never gonna give you up",
        limit: "25", 
        alltraks: "no",
        output: "json"
    }
    const api_params = new URLSearchParams(params)
    const search_data = await lf.get("/api/v1/search?"+api_params.toString()).then(res => res.data.tracks[0])

    const lyrics = await lf.get((`/_next/data/CDBg4ohJo18o4YRPWxhlo/en-US/lyrics/${search_data.slug}.json`)).then(({ data }) => data.pageProps.songData.track.lyrics)

    return {
        title: search_data?.title,
        artist: search_data?.artist.name,
        album: search_data?.album.title,
        cover: ["http://images.lyricfind.com/images", search_data?.album.coverArt].join("/"),
        lyrics
    }
}