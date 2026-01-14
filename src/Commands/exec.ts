import { Bot } from "../System/init"

import * as util from "util";
import * as cp from "child_process";
const exec = util.promisify(cp.execSync)

export async function callback(this: Bot, m): Promise<any> {
    if (!m.text.body) return;
    return new Promise((resolve, reject) => {
        this.setTimeout(reject);
        
        let res
        try {
            res = cp.execSync(m.text.body)
        } catch (e) {
            res = e
        } finally {
            m.reply({ text: util.format(res+"") })
            .then(resolve)
            .catch(reject)
        }
    })
}
export const trigger =  /^\$|ex(ec)?$/

export const metadata = {
    name: "exec",
    category: "owner",
    description: "for purposed use owner"
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
        owner: true,
        verified: false
    }
}

export const status = {
    beta: false,
    legacy: false,
    disable: false
}

export function help(type) {
    
}
