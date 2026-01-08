import { AuthenticationState } from "@adiwajshing/baileys"

export interface user {
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

export interface group {
    id: string;
    gid: string;
    subject: string;
    creation: number;
    desc: string;
    descId: string;
    restrict: boolean;
    announce: boolean;
    participants: object[];
    ephemeralDuration: number;
    config: {
        blacklist: {
            participant: string[],
            country: string[]
        };
        anti: {
            virtex: boolean;
            spam: boolean;
            link: boolean;
        };
        greeting: {
            active: boolean;
            join: string;
            leave: string;
        };
        nsfw: boolean;
    };
}

interface IOwner {
    profile: {
        name: string;
    };
    phone: string;
    donate: any;
}

export interface config {
    owner: IOwner[];
    administrator: {
        [key: string]: boolean
    }
    prefix: string;
    timezone: string;
    db: {
        name: string;
        dir: string;
        file: any;
    };
    'read-only': boolean;
    'qrterm': boolean;
}