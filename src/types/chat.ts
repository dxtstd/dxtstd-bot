import { proto as WAProto } from "@adiwajshing/baileys"
import { IsChatType, OptsDownload, OptsResend } from './simpler'

export interface ChatType {
    key: WAProto.MessageKey;
    message: any;
    pushName: string;
    is: IsChatType;
    download: (opts: OptsDownload) => any;
    resend: (opts: OptsResend) => void;
}
