import * as DEFAULTS from "./default"
import * as m3u8_parser from "m3u8-parser";

function m3u8_toList(manifest: string): any[] {
  const parser = new m3u8_parser.Parser()
  parser.push(manifest)

  return parser.manifest.playlists || parser.manifest.segments
}

async function getm3u8(url: string) {
  const manifest = (await DEFAULTS.AP.v1.get(url.split("/").splice(3).join("/"))).data

  return manifest
}

type TResVid = "240w"|"360w"|"480w"|"640w"|"720w"

async function playlists_to_video(url: string): Promise<{ [T in TResVid]?: string }> {
  const parseURLVideo = url.split("/").reverse().splice(1).reverse().join("/")
  const result: { [T in TResVid as string ]?: string } = {}

  const playlists = m3u8_toList(await getm3u8(url))
  for (const json of playlists) {
    if ((json.uri as string).endsWith(".m3u8")) {
      const playlist = await getm3u8(parseURLVideo+"/"+json.uri)
      result[((json.uri as string).split(".")[0].split("_")[1])] = parseURLVideo+"/"+m3u8_toList(playlist)[0].uri
    }
  }

  return result
}

function getmp4 (url: string): string {
  const splitUrl = url.split("/")
  let res = splitUrl

  res[4] = "mc"
  res[5] = "720p"
  res[9] = splitUrl[9].replace(".m3u8", ".mp4")

  return res.join("/")
}

interface IMetadataPostVideo {
  url: string;
  thumbnail: string;
  other: {
    mp4: any;
    exp: any;
    hls: any;
    cmfv: any;
    ts: any;
  }
}

export async function getVideoFromSearch({ video_list }): Promise<IMetadataPostVideo> {
  const json: IMetadataPostVideo = {
  url: "",
  thumbnail: "",
  other: {
    mp4: {},
    exp: {},
    hls: {},
    cmfv: {},
    ts: {}
  }
  }

  const main = DEFAULTS.video_list.hls.map((v) => video_list[v]).filter(v => v)[0]

  const result = await playlists_to_video(main.url)
  const ext = result["720w"]?.toString().split("/").reverse()[0].split(".")[1] || undefined

  for (const type_video of Object.keys(DEFAULTS.video_list)) {
    for (const part_of_type_video of DEFAULTS.video_list[type_video]) {
      json.other[type_video][part_of_type_video] = video_list[part_of_type_video]?.url
    }
  }

  for (const part_video_m3u8 of Object.keys(result)) {
    if (!!ext) {
      json.other[ext] = {}
      json.other[ext][part_video_m3u8] = result[part_video_m3u8]
    }
  }

  for (const mp4Video of Object.keys(json.other.mp4)) {
    if (Object.keys(json.other.mp4).length == 0) {
      json.url = json.other.mp4[mp4Video]
    }
  }

  if (json.url == "") {
    json.url = getmp4(main.url)
  }

  json.thumbnail = main.thumbnail

  return json
}

export interface IMetadataPost {
  title: string;
  description: string;
  author: {
    name: string;
  }
  image: null|any;
  video: null|IMetadataPostVideo;
  url: string;
  id: string;
}

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
export async function scrapSearch (raw_data: any[], opts?: IOpts): Promise<IMetadataPost[]> {
  const Result: IMetadataPost[] = [];

  for (const raw_data_post of raw_data.splice(1)) {
    const metadata: IMetadataPost = {
      title: '',
      description: '',
      author: {
        name: ''
      },
      image: null,
      video: null,
      url: "",
      id: ""
    }

    metadata.title = (raw_data_post.title || raw_data_post.rich_summary?.display_name || raw_data_post.grid_title || 'TITLE')
    metadata.description = (raw_data_post.description || raw_data_post.rich_summary?.description || raw_data_post.grid_description || 'DESCRIPTION')

    metadata.image = {}
    metadata.image["best"] = (!!raw_data_post.images ? 
      (
          raw_data_post?.images[
              (Object.keys(raw_data_post?.images||{}).reverse())[0]
          ]?.url 
      ) : null)

    for (const res_image of Object.keys((raw_data_post?.images||{})).reverse()) {
      metadata.image[res_image] = raw_data_post.images[res_image]?.url
    }

    metadata.url = "https://pinterest.com/pin/" + raw_data_post.id
    metadata.author.name = (raw_data_post.pinner?.username || raw_data_post.pinner?.full_name)

    if (raw_data_post.videos != null) {
      metadata.video = await getVideoFromSearch(raw_data_post.videos)
    }

    const pushMetadata = {
      media: true,
      date: true
    }

    if (opts) {
      if (opts.filter) {
        if (opts.filter?.media?.image && opts.filter?.media?.video) {
          pushMetadata.media = true
        } else if (opts.filter?.media?.video) {
          if (metadata.video) {
            if (metadata.video?.url == "") pushMetadata.media = false
          } else {
            pushMetadata.media = false
          }
        } else if (opts.filter?.media?.image) {
          if (metadata.image?.best == "") pushMetadata.media = false
        }
      } else {
        
      }
    } else {
      
    }

    if (pushMetadata.media && pushMetadata.date) Result.push(metadata)
  }

  return Result
}