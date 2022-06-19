import { DataType } from './data'

export interface CommandType {
    default: (client: any, { data: DataType, database }, logger: any) => void;
    permission: {
        owner: boolean;
        admin: {
            bot: boolean;
            normal: boolean;
            super: boolean;
        };
        premium: boolean;
        group: boolean;
        private: boolean;
    };
    need: {
        register: boolean;
        limit: {
            amount: number;
        };
        cash: {
            amount: number
        };
        level: number;
    };
    name: string;
    help: Array<string>;
    category: string;
    use: RegExp;
    disable: {
        active: boolean;
        reason: string
    };
    beta: boolean;
    support: {
        android: boolean;
        linux: boolean;
        windows: boolean
    }
}
