const USER = {
    id: '',
    uid: '',
    profile: {
        name: {
            notify: '',
            contact: ''
        }
    },
    status: {
        verified: false,
        banned: false,
        premium: {
            active: false,
            expired: 0
        }
    },
    level: 1,
    exp: {
        current: 0,
        need: 0
    },
   cash: 0,
    history: {
        purchase: {},
        donate: {},
        command: {
            last: ''
        }
    }
};

const GROUP = {
    gid: '',
    config: {
        anti: {
            link: false,
            virtex: false,
            spam: false
        },
        greeting: {
            active: false,
            join: 'Welcome @user, in group @subject!',
            leave: 'Goodbye @user, from @subject'
        },
        nsfw: false
    }
};

const CONFIG = {
    owner: {
        profile: {
            name: ''
        },
        NoPhone: ''
    },
    prefix: '%',
    timezone: 'Asia/Makassar',
    db: {
        name: 'main',
        dir: '',
        file: {}
    },
    ReadOnly: false,
    QRImage: false
};

export {
    USER,
    GROUP,
    CONFIG
};