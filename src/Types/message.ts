import {
    proto
} from "@adiwajshing/baileys";


export interface IMessage extends proto.IWebMessageInfo {
    text: {
        full: string;
        body: string;
        args: string[];
        command: string|undefined;
    };
    quoted: Partial<IMessage>;
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
    group: any;
    user: any;
    name: {
        group: string;
        user: string;
    };
    download: (this: IMessage, opts: any) => Promise<any>;
    resend: (this: IMessage, opts: any) => Promise<any>;
    reply: (this: IMessage, content: any, opts: any) => Promise<any>
}

