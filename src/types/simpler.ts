export declare interface IsChatType {
    baileys: boolean;
    forward: boolean;
    media: boolean;
    quoted: boolean;
}

export declare interface OptsDownload {
    stream: true;
    path: string;
}

export declare interface OptsResend {
    remoteJid: string;
}