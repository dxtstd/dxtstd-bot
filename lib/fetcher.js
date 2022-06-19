const axios = require('axios')
const https = require('https')
const http = require('http')

exports.getBuffer = async(url, options) => {
    try {
        options ? options : {}
        const res = await axios({
            method: "get",
            url,
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
            },
            ...options,
            responseType: 'arraybuffer'
        })
        return res.data
    } catch (e) {
        console.log(`Error : ${e}`)
    }
}

exports.getWeb = async function (url, options) {
    let ress
    try {
        options ? options : {}
        const res = await axios({
            url,
            ...options
        })
        ress = res.data
    } catch (e) {
        console.log(e)
        ress = JSON.parse(JSON.stringify(e, null, '\t'))
    } finally {
        return ress
    }
};


exports.getJSON = async function (url, options) {
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