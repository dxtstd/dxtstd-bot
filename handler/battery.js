module.exports = async (json) => {
    const bateri = json[2][0][1].value
    const persenbat = parseInt(bateri)
    baterai = global.db.bot.client.device.battery
    baterai.percentage = `${persenbat}%`
    baterai.status = json[2][0][1].live ? 'CHARGING': 'NOT_CHARGING'
    baterai.powersafe = json[2][0][1].powersafe
}