import * as defaults from "./default";
import { scrapSearch, IMetadataPost } from "./scrap";
import * as fsp from "fs/promises";

interface IOpts { 
  filter?: { 
    media?: { 
      video?: boolean,
      image?: boolean },
    author?: {
      id?: string|number,
      name?: string } 
    date?: {
      from: string,
      to?: string
    }
  }
}

export const keyword = async function SearchByKeyword(keyword: string, opts?: IOpts): Promise<{ result: IMetadataPost[] }> {
  const OptionSearch = {
    options: {
      auto_correction_disabled: false,
      bookmarks: [],
      field_set_key: 'unauth_react',
      no_fetch_context_on_resource: false,
      page_size: 100,
      query: keyword,
      redux_normalize_feed: true,
      rs: 'typed',
      scope: 'pins',
    },
    context: {}
  };

  const LinkSearch = await defaults.AP.main.get(`resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(keyword)}%26rs%3Dtyped%26term_meta%5B%5D%3D${encodeURIComponent(keyword)}%7Ctyped&data=${encodeURIComponent(JSON.stringify(OptionSearch))}&_=${Date.now()}`)  
  const Result = await scrapSearch(LinkSearch.data?.resource_response?.data?.results, opts)
  
  return {
    result: Result
  }
}

export const pin = async function InfoPin(id: number|string, opts?: IOpts): Promise<void> {
  const OptionPin = {
    options: {
      id,
      field_set_key: 'auth_web_main_pin',
      noCache: true,
      fetch_visual_search_objects: true
    },
    context: {}
  }
  
  const LinkPin = await defaults.AP.main.get(`resource/PinResource/get/?source_url=%2Fpin%2F${id}%2F&data=${encodeURIComponent(JSON.stringify(OptionPin))}`)
}

//keyword("sucrose video", { filter: { media: { video: true } }}).then((jsong) => fsp.writeFile("./res.json", JSON.stringify(jsong, null, "  ")))