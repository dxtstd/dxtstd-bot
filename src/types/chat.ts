import { proto as WAProto } from "@adiwajshing/baileys"
import { IsChatType } from './simpler'
import { OptsDownload, OptsResend } from './opts'

export interface ChatType {
    key: WAProto.MessageKey;
    message: any;
    pushName: string;
    is: IsChatType;
    download: (opts: OptsDownload) => any;
    resend: (opts: OptsResend) => void;
}
