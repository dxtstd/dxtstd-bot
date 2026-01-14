import axios from "axios";
import * as tough_cookie from "tough-cookie";

//video_list["V_HLSV4"]
export const video_list = {
  hls: ["V_HLSV4", "V_HLSV3_WEB", "V_HLSV3_MOBILE"],
  exp: ["V_EXP3","V_EXP4","V_EXP5","V_EXP6","V_EXP7"],
  mp4: ["V_720P"]
}

export const URL = {
  main: "https://www.pinterest.com/",
  v1: "https://v1.pinimg.com/",
  i: "https://i.pinimg.com/"
}
export const APC = new tough_cookie.CookieJar()
export const AP = {
  main: axios.create({
    baseURL: URL.main,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      "Referer": URL.main
    }
  }),
  v1: axios.create({
    baseURL: URL.v1,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      "Referer": URL.main
    }
  }),
  i: axios.create({
    baseURL: URL.v1,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      "Referer": URL.main
    }
  })
}