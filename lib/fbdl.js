const request = require('request-promise')
const util = require('util')
const fs = require('fs')
const {
    JSDOM
} = require("jsdom")

const user = [`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.47 Safari/537.36`, `Mozilla/5.0 (Linux; Ubuntu; amd64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.116 Safari/537.36`]

const URLvalid = function(url) {
    const REGEX = /(https?:\/\/)(www\.|m\.)?(facebook|fb).com/;
    if (!url || typeof url !== "string") return false;
    return REGEX.test(url);
}

const getInfo = async (link) => {
    if (!URLvalid(link)) {
        return (new Error(`URL Tidak Valid!`))
    }

    lemao = await request.get(link, {
        headers: {
            'User-Agent': user[0]
        }
    })
    const document = new JSDOM(lemao).window.document
    const rawdata = document.querySelector('script[type="application/ld+json"]').innerHTML;
    const json = JSON.parse(rawdata)

    let type = null
    let video
    let image
    let text = json.articleBody

    if (json.image != undefined) {
        type = "image"
        image = json.image
    } else if (json.contentUrl != undefined) {
        type = "video"
        video = json.contentUrl
        text = json.description
    } else if (json.image == undefined && json.contentUrl == undefined) {
        type = "text"
    } else {
        type = null
    }

    const obj = {
        type: type,
        title: json.headline,
        text: text,
        uploadedAt: new Date(json.uploadDate),
        author: {
            name: json.author.name,
            url: json.author.url
        },
        file: {
            video: video,
            image: image
        },
        comment: json.comment,
        totalcomment: json.commentCount
    }
    return obj
}

module.exports = {
    getInfo
}