import { Bot } from "../System/init"
import * as types from "../Types"

import { scrapper } from '../Utils'

export async function callback(this: Bot, m: types.message): Promise<any> {
    return new Promise((resolve, reject) => {
      this.setTimeout(reject)
        
      if (m.text.body.length <= 0) {
          m.reply({
              text: "where the keyword?"
          })
          .then(resolve)
          .catch(reject)
          return
      }
      
      scrapper.pinterest.keyword(m.text.body, { filter: { media: { video: true } }})
      .then(pins => {
          if (pins.result.length <= 0) {
              m.reply({
                  text: "result not found!"
              })
              .then(resolve)
              .catch(reject)
          } else return pins.result[
              Math.floor(Math.random() * pins.result.length)
          ]
      })
      .then(pin => {
          const caption = (
              (
              '[ PINTEREST ]' + '\n' + '\n' +
              'title: %title%' + '\n' +
              'description: %desc%' + '\n' +
              'pin: %pin%'
              ).replace('%title%', pin.title)
              .replace('%desc%', pin.description)
              .replace('%pin%', pin.url)
          )
          
          if (pin.video) {
            m.reply({ video: { url: pin.video.url }, caption })
            .then(resolve)
            .catch(reject)
          } else if (pin.image) {
            m.reply({ image: { url: pin.image.best }, caption })
            .then(resolve)
            .catch(reject)
          }
      })
      .catch(reject)
    })
}
export const trigger = (/^pinterest$/i)

export const metadata = {
    name: "pinterest",
    category: "download",
    description: "check speed this bot :O"
}

export const requirement = {
    cash: 0,
    level: 0,
    premium: false,
    user: {
        admin: {
            bot: false,
            group: {
                super: false,
                normal: false
            }
        },
        owner: false,
        verified: true
    }
}

export const status = {
    beta: false,
    legacy: false,
    disable: false
}

export function help(type) {
    
}
