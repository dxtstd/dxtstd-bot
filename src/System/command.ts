import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

import { logger } from '../Utils';
import * as types from '../Types';

interface CategoryCommand {
    config: any;
    downloader: any;
    games: any;
    general: any;
    owner: any;
    utility: any;
}

interface ClassCommands {
    category: CategoryCommand;
    uncategory: any;
    watch: any;
    load: () => void
}

const COMMANDS_PATH = path.resolve(__dirname, '..', 'Commands/');
const DEVICE_OS = os.platform()
const watcher = function(dir) {

}

const loader = function loader(this: ClassCommands) {
    const dir = fs.readdirSync(COMMANDS_PATH)
    for (const FileCommand of dir) {
        try {
            let TMPLoadCMD = {} as types.command.ICommand
            const CommandOnDir = (!(FileCommand.endsWith('.ts')) && (fs.existsSync(path.join(COMMANDS_PATH, FileCommand, 'index.ts'))))
            const CommandOnFile = (FileCommand.endsWith('.ts'))
            if (CommandOnDir) {
                //delete require.cache[require.resolve(FileCommand)]
                TMPLoadCMD = require(path.join(COMMANDS_PATH, FileCommand))
            } else if (CommandOnFile) {
                //delete require.cache[require.resolve(FileCommand)]
                TMPLoadCMD = require(path.join(COMMANDS_PATH, FileCommand))
            } else {
                continue
            }
            
            if (!TMPLoadCMD.callback) {
                
                continue
            }
            
            /*
            if (!TMPLoadCMD.support[DEVICE_OS]) {
                
                continue
            }
            if (TMPLoadCMD.disable.active) {
                
                continue
            }
            if (TMPLoadCMD.beta) {
                //
            }
            */
            
            let command_has_load: boolean = false
            const reload_func = () => {
                logger.warn("reload command: %s", path.join(COMMANDS_PATH, FileCommand))
                fs.readdirSync(path.join(COMMANDS_PATH, FileCommand)).forEach(file => {
                    delete require.cache[path.join(COMMANDS_PATH, FileCommand, file)]
                })
                delete this.watch[path.join(COMMANDS_PATH, FileCommand)]
                this.load ? this.load() : void 0
            }
                
            if (!this.watch[path.join(COMMANDS_PATH, FileCommand)]) {
                this.watch[path.join(COMMANDS_PATH, FileCommand)] = fs.watch(path.join(COMMANDS_PATH, FileCommand), function () {
                    reload_func()
                    this.close()
                })
            } /* else {
                this.watch[path.join(COMMANDS_PATH, FileCommand)]?.close()
                delete this.watch[path.join(COMMANDS_PATH, FileCommand)]
            } */
            
            if (!!TMPLoadCMD.metadata?.category) {
                (!(this.category[TMPLoadCMD.metadata?.category]) && (this.category[TMPLoadCMD.metadata?.category] = {}));
                this.category[TMPLoadCMD.metadata?.category][TMPLoadCMD.metadata?.name] = TMPLoadCMD
            } else {
                this.uncategory[TMPLoadCMD.metadata?.name] = TMPLoadCMD
            }
            
            
            
        } catch (error) {
            //logger.error(error)
            throw error
        }
    }
}

export class Commands implements ClassCommands {
    public category: CategoryCommand = {} as CategoryCommand
    
    public uncategory: any = {}

    public watch: any = {}
    
    declare load: () => void
    constructor() {
        this.load = loader
        this.load()
    }
}