import * as fs from 'fs'
import * as path from 'path'

import { logger } from '../Utils';
import * as defaults from '../Defaults'

import {
    AuthenticationState,
    BufferJSON,
    initAuthCreds,
    makeInMemoryStore
} from '@adiwajshing/baileys'

const PathDatabase = path.join(__dirname, '..', '..', 'database/')
!fs.existsSync(PathDatabase) && fs.mkdirSync(PathDatabase)

const MakePathDatabase = function (name?: string) {
    name = name || 'main'
    const DirDB = (path.resolve(__dirname, '..', '..', 'database', name) + '/')
    const FileConfigJSON = DirDB + 'config.json'
    const FileAuthJSON = DirDB + 'auth.json'
    const FileUsersJSON = DirDB + 'users.json'
    const FileGroupsJSON = DirDB + 'groups.json'
    const FileStoreJSON = DirDB + 'store.json'
    const FileResponseJSON = DirDB + 'response.json'
    
    return {
        dir: DirDB,
        file: {
            config: FileConfigJSON,
            store: FileStoreJSON,
            response: FileResponseJSON,
            auth: FileAuthJSON,
            users: FileUsersJSON,
            groups: FileGroupsJSON,
        }
    }
}

const Stringify = function (value: object={}, replacer: any=null, space='\t'): string {
    return JSON.stringify((value || {}), (replacer), (space))
}

const NotEmptyFile = function (file) {
    const exist = fs.existsSync(file)
    if (exist) {
        const buffer = fs.readFileSync(file)
        if ((buffer).length < 1) {
            return false
        } else if ((buffer).length > 0) {
            return true
        } else return false
    } else return false
}

const NotEmptyJSON = function (value) {
    return ((JSON.stringify(value) != "{}"))
}

const ExistDatabase = function (this: any, name?: string): boolean {
    name = name || this.config.db.name || 'main'
    
    const PathDB = MakePathDatabase(name)
    return fs.existsSync(PathDB.dir)
};

const CreateDatabase = function (this: any, name?: string): void {
    if (this.exist(name)) { 
        logger.warn('This database has exists!');
        this.load(name);
        return
    }
    
    name = name || this.config.db.name || 'main'
    this.config.db.name = name
    logger.info('Make database for "%s"...', name)

    const PathDB = MakePathDatabase(name)
    
    this.config.db.dir = PathDB.dir;
    this.config.db.file = PathDB.file;
    
    fs.mkdirSync(PathDB.dir)
    Object.keys(PathDB.file).forEach((value) => {
        try {
            fs.writeFileSync(PathDB.file[value], Stringify(this[value]))
        } catch (error) {
            logger.error(error)
        }
    })
};

const LoadDatabase = function (this: any, name?: string) {
    name = name || this.config.db.name || 'main';
    this.config.db.name = name

    logger.debug('Load database "%s"...', name)

    if (!this.exist(name)) {
        logger.warn('This database doesn\'t exists!');
        this.create(name);
        return
    }
    
    const PathDB = MakePathDatabase(name)
    
    this.config.db.dir = PathDB.dir;
    this.config.db.file = PathDB.file;
    
    Object.keys(PathDB.file).forEach((value) => {
        try {
            if (value == 'auth') {
                /*
                if (!NotEmptyFile(PathDB.file[value])) return;
                this[value] = (useSingleFileAuthState(PathDB.file[value])).state;
                if (!this[value].creds) this[value].creds = initAuthCreds();
                */
            } else if (value == "store") {
                /*
                if (!this.store?.bind) this.store = makeInMemoryStore((NotEmptyFile(PathDB.file[value]) ? JSON.parse(String(fs.readFileSync(PathDB.file[value]))) : this[value]));
                (this.store?.readFromFile(PathDB.file[value])
                */
            } else {
                this[value] = NotEmptyFile(PathDB.file[value]) ? JSON.parse(String(fs.readFileSync(PathDB.file[value]))) : this[value]
            }
        } catch (error) {
            logger.error(error)
        }
    })
}
const SaveDatabase = function (this: any, name?: string) {
    name = name || this.config.db.name || 'main'
    logger.debug('Save database "%s"...', name)
    
    const PathDB = MakePathDatabase(name);
    
    Object.keys(PathDB.file).forEach((value) => {
        try {
            if (NotEmptyJSON(this[value])) {
                if (value == 'auth') {
                    fs.writeFileSync(PathDB.file[value], Stringify(this[value], BufferJSON.replacer))
                } else if (value == "store") {
                   //this.store?.writeToFile(PathDB.file[value])
                } else {
                    fs.writeFileSync(PathDB.file[value], Stringify(this[value]))
                }
            }
        } catch (error) {
            logger.error(error)
        }
    })
}


const CreateBackupDatabase = function (this: any, name?: string, opts: any={}) {
    /* */
}

const RestoreBackupDatabase = function (this: any, name?: string, opts: any={}) {
    /* */
}

const AutoBackupDatabase = function (this: any, opts: any={}) {
    /* */
}

export class Database {
    config = defaults.config;
    store = makeInMemoryStore({});
    response = {};
    
    groups = {};
    
    declare exist: (name?: string) => void;
    declare create: (name?: string) => void;
    declare load: (name?: string) => void;
    declare save: (name?: string) => void;
    
    declare backup: {
        create: (name?: string, opts?: any) => void,
        restore: (name?: string, opts?: any) => void,
        auto: (opts?: any) => void
    };
    
    constructor(name?: string) {
        this.config.db.name = name || 'others';
        this.store = makeInMemoryStore({});
        this.exist = ExistDatabase;
        this.create = CreateDatabase;
        this.load = LoadDatabase;
        this.save = SaveDatabase;
        
        this.backup = {
            create: CreateBackupDatabase,
            restore: RestoreBackupDatabase,
            auto: AutoBackupDatabase
        }
    }
}
