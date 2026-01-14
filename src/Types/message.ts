import {
    proto
} from "@whiskeysockets/baileys";
import * as database from "./database"

export interface message extends proto.IWebMessageInfo {
    text: {
        full: string;
        body: string;
        args: string[];
        command: string|undefined;
        prefix: string;
    };
    quoted: Partial<message>|void;
    type: string;
    from: string;
    sender: string;
    on: {
        group: boolean;
        private: boolean;
    };
    is: {
        baileys: boolean;
        media: boolean;
        quoted: boolean;
    };
    group: database.data["group"];
    user: database.data["user"];
    name: {
        group: string;
        user: string;
    };
    download: (this: message, opts?: any) => Promise<any>;
    send: (this: message, opts?: any) => Promise<message>;
    resend: (this: message, opts?: any) => Promise<message>;
    reply: (this: message, content: any, opts?: any) => Promise<message>
    delete: (this: message, opts?: any) => Promise<message>
    edit: (this: message, content: any, opts?: any) => Promise<message>
}