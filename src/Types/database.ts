import { AuthenticationState } from "@adiwajshing/baileys"

export interface UserType {
    id: string;
    uid: string;
    profile: {
        name: {
            notify: string;
            contact: string;
        };
    };
    status: {
        verified: boolean;
        banned: boolean;
        premium: {
            active: boolean;
            expired: number;
        };
    };
    level: number;
    exp: {
        current: number;
        need: number;
    };
    cash: number;
    history: {
        purchase: any;
        donate: any;
        command: {
            last: string;
        };
    };
    is: {
        owner: boolean;
        //coowner: boolean;
        admin: {
            super: boolean;
            normal: boolean;
        };
    };
}

export interface GroupType {
    id: string;
    gid: string;
    subject: string;
    creation: number;
    desc: string;
    descId: string;
    restrict: boolean;
    announce: boolean;
    participants: Array<object>;
    ephemeralDuration: number;
    config: {
        greeting: {
            active: boolean;
            join: string;
            leave: string;
        };
        nsfw: boolean;
    };
}



export interface DatabaseType {
    config: {
        db: {
            name: string;
            dir: string;
            file: object;
        };
    };
    auth: AuthenticationState;
    users: any;
    groups: any;
    store: any;
    exist: (name?: string) => void;
    create: (name?: string) => void;
    load: (name?: string) => void;
    save: (name?: string) => void;
}