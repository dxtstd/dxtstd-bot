import axios from "axios";
import { JSDOM } from "jsdom"

const url = "https://www.proxynova.com/proxy-server-list/country-cn/"

async function start() {
    const html = await axios.get(url).then(res => res.data)
    const jsdom = new JSDOM(html)
    let [window, document] = [jsdom.window, jsdom.window.document]
    
    const res = [...document.getElementById("tbl_proxy_list").querySelectorAll("tr")].slice(1).slice(0, -1).map(tr => [eval((tr.querySelector("script").innerHTML).replace("document.write", "")), (([...tr.querySelectorAll("td")][1].textContent).replace(/ +/g, "")).replace(/\n/g, "")])
    console.log(res.map(v => ({ "host": v[0], "port": v[1] })))
}

start()