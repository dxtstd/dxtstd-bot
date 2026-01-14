import * as fs from 'fs'

import * as Jimp from 'jimp'

/**
 * resize image 
 * 
 * @param image - `path/buffer`
 * 
 */
const resize = async function(
    image: any, width: number, height: number
): Promise<Buffer> {
    const JimpImage = await Jimp.read(image)
    const ResizeImage = await JimpImage.resize(width, height)
    return (await ResizeImage.getBufferAsync('image/png'))
}

export {
    resize
}