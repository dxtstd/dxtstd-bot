import * as baileys from 'baileys';
import Database from './database.ts';
import Queue from './queue.ts';
import LoggerDefault from './logger.ts';

import pino from 'pino';

class AuthState {
  public creds: baileys.AuthenticationCreds;
  public keys: baileys.SignalKeyStore;

  private db: Database;
  private queue: Queue;
  private logger: pino.Logger;

  fixid(id: string) {
    const resId = id?.replace(/\//g, '__')?.replace(/:/g, '-');
    return resId;
  }

  private read = async (id: string) => {
    return new Promise((resolve, reject) => {
      this.db.pouchdb
        .find({
          selector: { _id: this.fixid(id) },
        })
        .then(({ docs }) => {
          if (!docs.filter((doc) => doc._id == this.fixid(id))[0]) this.logger.debug('skip'), resolve(void 0);
          if (!!docs.length) {
            this.db.pouchdb
              .get(this.fixid(id))
              .then((doc: any) => {
                this.logger.debug({ id: this.fixid(id) }, 'read data from auth');
                resolve(JSON.parse(doc.data, baileys.BufferJSON.reviver));
              })
              .catch((e) => this.logger.error(e));
          }
        });
    });
  }

  private write = async (id: string, data: any) => {
    let tmpdata: any = {};
    return new Promise((resolve, reject) => {
      this.db.pouchdb
        .find({
          selector: { _id: this.fixid(id) },
        })
        .then(({ docs }) => {
          if (docs.filter((doc) => doc._id == this.fixid(id))[0]) {
            this.db.pouchdb
              .get(this.fixid(id))
              .then(() => {
                this.db.pouchdb
                  .upsert(this.fixid(id), (doc: any) => {
                    doc.data = JSON.stringify(data || {}, baileys.BufferJSON.replacer, '\t');
                    if (!doc.count) {
                      doc.count = 0;
                    }
                    doc.count = doc.count + 1;
                    return doc;
                  })
                  .then((doc) => {
                    this.logger.debug({ id: this.fixid(id) }, 'writing (upsert) data to auth');
                    resolve(doc);
                  })
                  .catch(reject);
              })
              .catch(reject);
          } else {
            tmpdata._id = this.fixid(id);
            tmpdata.data = JSON.stringify(data || {}, baileys.BufferJSON.replacer, '\t');
            tmpdata.count = 0;
            this.db.pouchdb
              .putIfNotExists(tmpdata)
              .then((doc) => {
                this.logger.debug({ id: this.fixid(id) }, 'writing (put) data to auth');
                resolve(doc);
              })
              .catch(reject);
          }
        });
    });
  }

  private remove = async (id: string) => {
    return new Promise((resolve, reject) => {
      this.db.pouchdb
        .find({
          selector: { _id: this.fixid(id) },
        })
        .then(({ docs }) => {
          if (!docs.filter((doc) => doc._id == this.fixid(id))[0]) resolve({});
          if (docs.length) {
            this.db.pouchdb
              .get(this.fixid(id))
              .then((doc) => {
                this.db.pouchdb
                  .remove(doc._id, doc._rev)
                  .then(() => {
                    this.logger.debug({ id: this.fixid(id) }, 'remove data from auth');
                    resolve(void 0);
                  })
                  .catch((e) => {});
              })
              .catch((e) => {});
          } else {
            resolve({});
          }
        });
    });
  }

  public CredsKeysForAuthBaileys = () => {
    return {
      state: {
        creds: this.creds,
        keys: baileys.makeCacheableSignalKeyStore(this.keys, this.logger),
      },
    };
  }

  public load = async () => {
    this.logger.info('load creds...');
    this.creds = ((await this.read('creds')) as baileys.AuthenticationCreds) || baileys.initAuthCreds();
  }

  public saveCreds = async () => {
    return await this.queue.addWait(this.write, ["creds", this.creds]);
  }

  constructor() {
    this.db = new Database('auth');
    this.queue = new Queue();
    this.logger = LoggerDefault.child({ system: 'bot.authstate' });

    this.keys = {
      get: async (type, ids) => {
        return new Promise((resolve) => {
          const data: { [_: string]: baileys.SignalDataTypeMap[typeof type] } = {};
          this.queue.add(async () => {
            await Promise.all(
              ids.map(async (id) => {
                let value: any = await this.read(`${type}-${id}`);
                if (type === 'app-state-sync-key' && value) {
                  value = baileys.proto.Message.AppStateSyncKeyData.fromObject(value);
                }
                data[id] = value;
              }),
            );
            resolve(data);
          }, []);
        });
      },
      set: async (data) => {
        const tasks: Promise<void>[] = [];
        for (const category in data) {
          for (const id in data[category]) {
            const value = data[category][id];
            const id_data = `${category}-${id}`;
            value ? this.queue.add(this.write, [id_data, value]) : this.queue.add(this.read, [id_data]);
          }
        }
      },
    };
  }
}

export default AuthState;
