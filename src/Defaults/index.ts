const user = {
    id: '',
    uid: '',
    profile: {
        name: {
            notify: '',
            contact: ''
        }
    },
    config: {
        swm: ''
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

const group = {
    gid: '',
    config: {
        blacklist: {
            participant: [],
            country: []
        },
        anti: {
            link: false,
            virtex: false,
            spam: false,
            settings: false
        },
        greeting: {
            active: false,
            join: 'Welcome @user, in group @subject!',
            leave: 'Goodbye @user, from @subject'
        },
        nsfw: false
    }
};

const config = {
    owner: {},
    prefix: '%',
    timezone: 'Asia/Makassar',
    db: {
        name: 'main',
        dir: '',
        file: {
            config: '',
            store: '',
            response: '',
            auth: '',
            users: '',
            groups: ''
        }
    },
    'read-only': false,
    'qrterm': false
};

export {
    user,
    group,
    config
};
