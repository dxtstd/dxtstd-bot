import { spawn } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'

import * as CFonts from 'cfonts'

import { logger } from './src/Utils'

const packageJSON = JSON.parse(String(fs.readFileSync('./package.json')))

CFonts.say('dxtstd-bot', {
    font: 'block',
    align: 'center',
    colors: ['#70ccff', '#AEAEAE']
})

CFonts.say(`'${packageJSON.name}' By @${packageJSON.author.name || packageJSON.author}`, {
  font: 'console',
  align: 'center',
  colors: ['#70ccff']
})

let AutoRestart = false
let IsRunning = false


logger.info({
    OS: os.platform(),
    Arch: os.arch()
}, 'Detected System')

/**
 * Start a ts file
 * @param {String} file `path/to/file`
 */
 
const start = function (file: string, opts: object={}) {
    IsRunning = true
    const args = [path.resolve(__dirname, file), ...process.argv.slice(2)]
    let i = 0
    args.slice(1).forEach(v => {
        i ++
        const opts = v.replace(/--/g, '')
        switch (opts) {
            case 'auto-restart':
                logger.info('Enable Auto Restart (main ts-node)')
                AutoRestart = true;
                args.splice(i, 1)
                break;
        }
    })
    
    logger.info('starting ts-node %s', args[0])
    
    const node = spawn(process.argv[0], args, {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc']
    })
    
    node.on('exit', (...exit) => {
        IsRunning = false
        if (exit[0]) logger.warn('exit code: %s', exit[0])
        if (exit[1]) logger.warn('exit signal: %s', exit[1])
        if (IsRunning) return
        if (AutoRestart) logger.info('Restarting...'), start(file)
        
    })
    
    node.on('message', msg => {
        logger.info('Receive MSG (ts-node): %s', msg)
        switch (msg) {
            case 'shutdown':
                node.kill();
                process.exit();
                break;
            case 'restart':
                node.kill();
                IsRunning = false;
                if (AutoRestart) return;
                logger.info('Restarting...')
                start(file);
                break;
            case 'uptime':
                node.send(process.uptime())
                break
        }
    })
}

start('./src/index.ts')
