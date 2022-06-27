import { Database } from '../../System/database';
import * as types from '../../Types'

const greeting = {
    join: () => {},
    leave: () => {},
    enable: () => {},
    disable: () => {}
}

const ConfigTextJoinGreeting = function (text: string, id: string, database: types.DatabaseType) {
    database.load();
    
    const group = database.groups[id];
    group.config.greeting.join = text;
    
    database.groups[id] = group;
    database.save();
}

const ConfigTextLeaveGreeting = function (text: string, id: string, database: types.DatabaseType) {
    database.load();
    
    const group = database.groups[id];
    group.config.greeting.leave = text;
    
    database.groups[id] = group;
    database.save();
}

const ConfigActivationGreeting = function (active: boolean, id: string, database: types.DatabaseType) {
    database.load()
    
    const group = database.groups[id]
    if (active && group.config.greeting.active) throw new Error('This function has been activated')
    if (!active && !group.config.greeting.active) throw new Error('his function is not active')
    
    group.config.greeting.active = active
    database.save()
}

const nsfw = {
    enable: () => {},
    disable: () => {}
}

const ConfigActivationNSFW = function (active: boolean, id: string, database: types.DatabaseType) {
    
}

export class ConfigGroup {
    greeting = {
        text: {
            join: (text: string) => {},
            leave: (text: string) => {},
        },
        enable: () => {},
        disable: () => {}
    };
    
    nsfw = {
        enable: () => {},
        disable: () => {}
    };
    
    constructor(id, database) {
        const db = new Database(database.config.db.name || 'main')
        db.load()
        
        /** 
         * Config Greeting Text for new member joined
         * 
         * @param text - Text about welcome
         * 
         */
        this.greeting.text.join = function (text: string="") {
            if (text == "") {
                text = "Welcome @user, to @subject!"
            }
            
            return ConfigTextJoinGreeting(text, id, db)
        }
        
        /** 
         * Config Greeting Text for old member leave
         * 
         * @param text - Text about leave
         * 
         */
        this.greeting.text.leave = function (text: string="") {
            if (text == "") {
                text = "Goodbye @user, from @subject!"
            }
            
            return ConfigTextLeaveGreeting(text, id, db)
        }
        
        this.greeting.enable = function () {
            return ConfigActivationGreeting(true, id, db)
        }
        
        this.greeting.disable = function () {
            return ConfigActivationGreeting(false, id, db)
        }
    }
}