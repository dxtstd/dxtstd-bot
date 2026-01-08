import * as defaults from "../../../Defaults";

export async function handler(bot, m): Promise<void> {
    if (!m.on.group) return void 0;
    if (!bot.isAdmin(m.from)) return void 0;

    bot.database.load();

    const group = bot.database.groups[m.from] || defaults.group
    if (!group?.config?.anti.settings) return void 0;

    const regexLink = /^(https?:\/\/)?wa\.me\/settings/
    const link: string[] = (m.text.full.toLowerCase().replace(/\n/gi, ' ').split(/ +/g).filter(v => { return v.replace(/[\@\#\$\_\&\-\+\(\)\*\"\'\;\!\?\~\`\|\•\√\π\÷\×\¶\∆\£\¢\€\¥\^\°\=\{\}\\\%\©\®\™\✓\[\]\<\>]/g, '').match(regexLink) }) || [])

    if (!!link[0]) {
	await bot.sock.sendMessage(m.from, {
            delete: m.key
	})
    }
}
