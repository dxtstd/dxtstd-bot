//import { DataType } from './data';

export interface CommandType {
    default: (client: any, { data: DataType, database }, logger: any) => void;
    permission: {
        admin: {
            bot: boolean;
            normal: boolean;
            super: boolean;
        };
        owner: boolean;
        premium: boolean;
        group: boolean;
        private: boolean;
    };
    need: {
        //args: boolean;
        cash: {
            amount: number
        };
        limit: {
            amount: number;
        };
        level: number;
        register: boolean;
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