//import { DataType } from './data';

export interface ICommand {
    callback: (bot, m, text) => Promise<any>;
    metadata: {
        name: string;
        description?: string;
        category: string;
    };
    help: {
        command: () => any;
        menu: () => any;
    }
    requirement: {
        admin?: {
            normal?: boolean;
            super?: boolean;
            bot?: boolean;
        },
        owner?: boolean
    };
    status: {
        maintance?: false,
        beta?: false,
        disable?: {
            active: false,
            reason: ""
        }
    }
    trigger: RegExp
}