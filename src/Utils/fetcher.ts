import axios from 'axios'
import * as https from 'https'
import * as http from 'http'

const getBuffer = async(url, options) => {
    options ? options : {}
    try {
        const res = await axios({
            method: 'GET',
            url,
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
            },
            responseType: 'arraybuffer',
            ...options
        })
        return res.data
    } catch (e) {
        console.log(`Error : ${e}`)
    }
}

const getWeb = async function (url, options) {
    options ? options : {}
    try {
        const res = await axios({
            url,
            ...options
        })
        return res.data
    } catch (e) {
        console.log(e)
        return JSON.parse(JSON.stringify(e, null, '\t'))
    }
};


const getJSON = async function (url, options) {
    options ? options : {}
    let res;
    try {
        res = await axios({
            url,
            ...options
        })
    } catch (e) {
        console.log(e)
        res = JSON.parse(JSON.stringify(e, null, '\t'))
    }
    if (res.headers && res.headers['content-type'] == 'application/json') {
        return res.data
    } else {
        return {}
    }
}

export {
    getWeb,
    getBuffer,
    getJSON
}