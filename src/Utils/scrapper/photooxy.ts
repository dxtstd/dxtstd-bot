import axios from "axios";
import FormData from "form-data";
import * as tough_cookie from "tough-cookie";
import { JSDOM } from "jsdom";

const po_url = "https://photooxy.com"
const po_effect = [
    "/elegant-3d-neon-dark-metal-text-effect-online-free-416.html",
    "/shadow-text-effect-in-the-sky-394.html",
    "/create-blackpink-style-logo-effects-online-for-free-417.html",
    "/create-a-wolf-metal-text-effect-365.html",
    "/create-battlefield-4-rising-effect-152.html",
    "/make-wallpaper-battlegrounds-logo-text-146.html",

]

export async function text(text: string[], effect: number=0) {
    const po = axios.create({
        baseURL: po_url,
        headers: {
           "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
        }
    });
    const cookiejar = new tough_cookie.CookieJar();

    await po.head(po_effect[effect])
    .then(res => cookiejar.setCookie(res.headers["set-cookie"][0], po_url));

    await cookiejar.getCookies(po_url)
    .then((cookie) => {
        po.defaults.headers.common["Cookie"] = cookie
    });

    const html_step_1 = await po.get(po_effect[effect]).then(res => res.data)
    const form_html_step_1 = (new JSDOM(html_step_1)).window.document.getElementsByClassName("ajax-submit")[0];
    const form_data_html_step_1 = [...form_html_step_1.querySelectorAll("input")].map(({ name, value }) =>[name, value]).filter(v => v[0] == "text[]" ? false : true)
    const form = new FormData()
    for (const texto of text) {
        form.append("text[]", texto||"example")
    }
    for (const data of form_data_html_step_1) {
         form.append(data[0], data[1]) 
    }

    const html_step_2 = await po.post(po_effect[effect], form).then(res => res.data)
    const data_raw_html_step_2 = JSON.parse((new JSDOM(html_step_2)).window.document.getElementById("form_value").innerHTML)
    const params = new URLSearchParams()
    for (const name_object of Object.keys(data_raw_html_step_2).filter(v => v == "text" ? false : true)) {
        params.append(name_object, data_raw_html_step_2[name_object])
    }
    for (const texto of data_raw_html_step_2["text"]) {
        params.append("text[]", texto)
    }
    
    const result = await po.post("/effect/create-image/", params.toString()).then(res => res.data)
    return {
        text,
        image:data_raw_html_step_2["build_server"] + result["image"],
        image_code: result["image_code"],
        effect_url: po_url+po_effect[effect]
    }
}