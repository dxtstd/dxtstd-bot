import { Bot } from "../init"
import * as types from "../../Types"
import * as defaults from "../../Defaults"
import * as utils from "../../Utils"

//import { parsePhoneNumber } from 'awesome-phonenumber'
import * as moment from 'moment-timezone'

export async function updateDatabase(this: Bot, gid): Promise<void> {
    if (!gid.endsWith('@g.us')) return;

    const fetchMetadata = async () => {
        const MetadataGroup = await this.sock.groupMetadata(gid);
        const fixMetadata: types.database.data["group"] = {
            ...MetadataGroup
        } as types.database.data["group"];
        fixMetadata['subject'] = MetadataGroup.subject.replace(/\n/g, ' ');
        fixMetadata['desc'] = (String(MetadataGroup.desc));
        return fixMetadata;
    };

    const doc_group = await this.database.read("groups", gid)
    const metadata = await fetchMetadata();
    const JSONGroup: types.database.data["group"] = {
        ...defaults.group,
        gid: String((await this.database.groups.allDocs()).total_rows),
        ...doc_group,
        ...metadata
    } as types.database.data["group"];
    
    await this.database.write("groups", gid, JSONGroup)
}

export async function participantUpdate(metadata) {
    const group = await this.database.exists("groups", metadata.id) ? await this.database.read("groups", metadata.id) : defaults.group
    const user = await this.database.exists("users", metadata.participants[0]) ? await this.database.read("users", metadata.participants[0]) : defaults.user
    switch(metadata.action) {
        case "add": {
            if (group.config.greeting.active) {
                const pp = await this.sock.profilePictureUrl(metadata.participants[0], "image").catch(() => {})
                await utils.greeting.join({
                    url: {
                        pp
                    },
                    text: {
                        name: {
                            user: user.profile.name?.notify ?? user.profile.name?.contact,
                            group: group.subject
                        },
                        time: moment.tz('Asia/Makassar').format('hh:mmA dddd, DD MMMM Y'),
                        rank: group.participants.length + " members",
                        wm: "dxtstd-bot"
                    }
                }).then(buffer => {
                    const caption = (group.config.greeting.join || "Welcome on this group!")
                                    .replace("@user", metadata.participants?.map(v => "@" + v.split("@")[0]).join(" "))
                                    .replace("@subject", group.subject);
                    
                    return this.sock.sendMessage(metadata.id, { image: buffer, caption, mentions: metadata.participants }, { ephemeralExpiration: (60*60*24) })
                })
            }
            break;
        }
        case "remove": {
            if (group.config.greeting.active) {
                const pp = await this.sock.profilePictureUrl(metadata.participants[0], "image").catch(() => {})
                await utils.greeting.leave({
                    url: {
                        pp
                    },
                    text: {
                        name: {
                            user: user.profile.name?.notify ?? user.profile.name?.contact,
                            group: group.subject
                        },
                        time: moment.tz('Asia/Makassar').format('hh:mmA dddd, DD MMMM Y'),
                        rank: group.participants.length + " members",
                        wm: "dxtstd-bot"
                    }
                }).then(buffer => {
                    const caption = (group.config.greeting.leave || "Goodbye from this group!")
                                    .replace("@user", metadata.participants?.map(v => "@" + v.split("@")[0]).join(" "))
                                    .replace("@subject", group.subject);
                    
                    return this.sock.sendMessage(metadata.id, { image: buffer, caption, mentions: metadata.participants }, { ephemeralExpiration: (60*60*24) })
                })
            }
        }
    }
}