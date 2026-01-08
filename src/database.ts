import logger_default from './logger.ts';
import Queue from './queue.ts';

import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import PouchDBUpsert from 'pouchdb-upsert';
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBUpsert);

import { fileURLToPath } from 'url';
import * as path from 'path';
import * as fs from 'fs';
import pino from 'pino';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_PATH_DATABASE = path.resolve(path.join(__dirname, '../', 'database'));

function CheckAndCreateFolderDatabase(this: Database): void {
  fs.existsSync(this.DEFAULT_PATH_DATABASE) || fs.mkdirSync(this.DEFAULT_PATH_DATABASE);
}

class Database {
  public pouchdb: PouchDB.Database;

  public DEFAULT_PATH_DATABASE: string = DEFAULT_PATH_DATABASE;
  public NAME_DATABASE = 'DB_DEFAULT';

  private logger: pino.Logger;
  private queue: Queue;
  private cacfd: (this: Database) => void = CheckAndCreateFolderDatabase.bind(this);

  constructor(name_db?: string, opts?: { path?: string }) {
    this.cacfd();
    this.queue = new Queue();
    this.logger = logger_default.child({
      system: 'bot.database.' + this.NAME_DATABASE,
    });

    if (name_db) this.NAME_DATABASE = name_db;
    this.pouchdb = new PouchDB(path.join(DEFAULT_PATH_DATABASE, this.NAME_DATABASE));
  }

  public async read(id: string) {
    return this.queue.addWait(async () => {
      return this.pouchdb
        .find({
          selector: { _id: id },
        })
        .then(({ docs }) => {
          if (!docs.filter((doc) => doc._id == id)[0]) return {};
          if (docs.length) {
            return this.pouchdb.get(id).then((doc: any) => {
              this.logger.debug({ id }, 'read data from database...');
              return doc;
            });
          } else {
            return {};
          }
        });
    }, []);
  }

  public async write(id: string, data: any) {
    return this.queue.addWait(async () => {
      return this.pouchdb
        .find({
          selector: { _id: id },
        })
        .then(({ docs }) => {
          if (docs.filter((doc) => doc._id == id)[0]) {
            return this.pouchdb
              .upsert(id, (doc) => {
                for (const keyObj of Object.keys(data)) {
                  doc[keyObj] = data[keyObj];
                }
                return doc;
              })
              .then((doc) => {
                this.logger.debug({ id }, 'upsert (write) data to database...');
                return doc;
              });
          } else {
            return this.pouchdb
              .putIfNotExists({
                _id: id,
                ...data,
              })
              .then((doc) => {
                this.logger.debug({ id }, 'put (write) data to database...');
                return doc;
              });
          }
        });
    }, []);
  }

  public async delete(id: string) {}

  public async exist(id: string) {}
}

export default Database;
