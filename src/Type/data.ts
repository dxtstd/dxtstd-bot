import { ChatType } from "./chat"
import { UserType, GroupType } from "./database"

export declare interface Text {
    full: string;
    args: Array<string>;
    body: string;
    command: string|undefined;
}

export interface DataType {
    data: DataType;
    chat: ChatType;
    type: string;
    from: string;
    on: {
        group: boolean;
        private: boolean;
    };
    sender: string;
    group: GroupType;
    user: UserType;
    name: {
        user: string;
        group: string;
    };
    text: Text
}
