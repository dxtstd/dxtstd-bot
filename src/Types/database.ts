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
    participants: object[];
    ephemeralDuration: number;
    config: {
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