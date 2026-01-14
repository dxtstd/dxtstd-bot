import PouchDB from "pouchdb"

type TDatabase = "auth"|"config"|"users"|"groups"|"response"

export interface main {
    auth: PouchDB.Database;
    config: PouchDB.Database;
    users: PouchDB.Database;
    groups: PouchDB.Database;
    response: PouchDB.Database;
    write: (type: TDatabase, id: string, data: any) => Promise<any>;
    read: (type: TDatabase, id: string) => Promise<any>;
    exists: (type: TDatabase, id: string) => Promise<boolean>;
    remove: (type: TDatabase, id: string, data: any) => Promise<any>
    queue: any
}

interface userdata {
    id: string;
    uid: string;
    profile: {
        name: {
            notify: string;
            contact: string;
        }
    }
    config: {
        swm: string;
    }
    status: {
        verified: boolean;
        banned: boolean;
        premium: {
            active: boolean;
            expired: number;
        }
    }
    level: number;
    exp: {
        current: number;
        need: number;
    },
    cash: number;
    history: {
        purchase: any;
        donate: any;
        command: {
            last: string;
        }
    }
};

interface groupdata  {
    [K: string]: any;
    gid: string;
    config: {
        blacklist: {
            participant: string[];
            country: string[];
        }
        anti: {
            link: boolean;
            virtex: boolean;
            spam: boolean;
            settings: boolean;
        }
        greeting: {
            active: boolean;
            join: string;
            leave: string;
        }
        nsfw: boolean
    }
};

export interface data {
    user: userdata,
    group: groupdata
}