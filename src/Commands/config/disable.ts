import { ConfigGroup } from './group'

const Disable = async function (
    args, { client, data, database }
): Promise<void> {
    const ConfigurationGroup = new ConfigGroup(data.from, database)
    const ConfigurationUser = {}
    const tipe = args[0]
    if (ConfigurationGroup[tipe]) {
        ConfigurationGroup[tipe].disable()
        client.sendMessage(data.from, {
            text: `*"${tipe}"* deactivated successfully`
        })
    } else if (ConfigurationUser[tipe]) {
         ConfigurationGroup[tipe].disable()
        client.sendMessage(data.from, {
            text: `*"${tipe}"* deactivated successfully`
        })
        
    } else {
        let TypeConfig: string = ''
        Object.keys(ConfigurationGroup).forEach(v => { TypeConfig+= v + ', ' })
        Object.keys(ConfigurationUser).forEach(v => { TypeConfig+= v + ', ' })
        const Text = `*"${tipe}"* not in the configuration type, \nonly available: ${TypeConfig.split('').reverse().slice(2).reverse().join('')}`
        throw new Error(Text)
    }
}

export {
    Disable
}