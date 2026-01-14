/*
auth
config
users
groups
response

const DEFAULT_PATH_DATABASE = "./database/"
*/

import * as path from "path";
import * as fs from "fs";
import * as util from "util";

import PouchDB from "pouchdb";
import * as pouchdbfind from "pouchdb-find";
import * as pouchdbupsert from "pouchdb-upsert";
PouchDB.plugin(pouchdbfind);
PouchDB.plugin(pouchdbupsert);

import { Queue } from "./queue";
import { database } from "../Types";
const queue = new Queue();

import logger_default from "../Utils/logger";
const logger = logger_default.child({ class: "dxtstd-bot", system: "database" });
const errorHandler = (...error) => logger.error(error);

const DEFAULT_PATH_DATABASE = path.resolve(__dirname, "../..", "database");

function checkandcreate(): void {
    fs.existsSync(DEFAULT_PATH_DATABASE) || fs.mkdirSync(DEFAULT_PATH_DATABASE);
}

function createdb(name) {
    checkandcreate();
    if (fs.existsSync(path.join(DEFAULT_PATH_DATABASE, name))) { 
        throw new Error(`Already have database with name: "${name}"`);
    }
    
    fs.mkdirSync(path.join(DEFAULT_PATH_DATABASE, name));

    new PouchDB(path.join(DEFAULT_PATH_DATABASE, name, "auth"));
    new PouchDB(path.join(DEFAULT_PATH_DATABASE, name, "config"));
    new PouchDB(path.join(DEFAULT_PATH_DATABASE, name, "users"));
    new PouchDB(path.join(DEFAULT_PATH_DATABASE, name, "groups"));
    new PouchDB(path.join(DEFAULT_PATH_DATABASE, name, "response"));

    return `Database "${name}" has successfully created.`
}

function checkdb(name): boolean {
    return fs.existsSync(path.join(DEFAULT_PATH_DATABASE, name))
}

function renamedb(name) {

}

function deletedb (name) {
    return {
        warning: "are you sure delete this database??, add .yes() for delete.",
        yes() {
            new PouchDB(path.join(DEFAULT_PATH_DATABASE, name, "auth")).destroy();
            new PouchDB(path.join(DEFAULT_PATH_DATABASE, name, "config")).destroy();
            new PouchDB(path.join(DEFAULT_PATH_DATABASE, name, "users")).destroy();
            new PouchDB(path.join(DEFAULT_PATH_DATABASE, name, "groups")).destroy();
            new PouchDB(path.join(DEFAULT_PATH_DATABASE, name, "response")).destroy();
            return `Database "${name}" has successfully deleted.`
        }
    }
}

type TDatabase = "auth"|"config"|"users"|"groups"|"response"

async function write(this: database.main, type: TDatabase, id: string, data: any): Promise<any> {
    if (!type) throw new SyntaxError("type not definedly!!")
    if (!id) throw new SyntaxError("id not definedly!!")
    if (!data) return

    const db = this[type] as PouchDB.Database
    return new Promise((resolve, reject) => {
        this.queue.add_and_wait(type, async function writeData() {
            return await db.find({
                selector: {_id: id}
            })
            .then(({ docs }) => {
                if (docs.filter(doc => doc._id == id)[0]) {
                    return db.upsert(id, (doc) => {
                        for (const vari of Object.keys(data)) {
                            doc[vari] = data[vari] 
                        }
                        return doc
                    })
                    .then((doc) => {
                        logger.debug({ type, id }, "upsert (write) data to database")
                        resolve(doc)
                    })
                    .catch((e) => (errorHandler("upsert (write)", util.format(e), { type, id }), resolve({})))
                } else {
                    return db.putIfNotExists({
                        _id: id,
                        ...data
                    })
                    .then((doc) => {
                        logger.debug({ type, id }, "put (write) data to database")
                        resolve(doc)
                    })
                    .catch((e) => (errorHandler("put (write)", util.format(e), { type, id }), resolve({})))
                }
            })
            .catch((e) => (errorHandler("find (write)", util.format(e), { type, id }), resolve({})))
        })
    }) 
}

async function read(this: database.main, type: TDatabase, id: string): Promise<any> {
    if (!type) throw new SyntaxError("type not definedly!!")
    if (!id) throw new SyntaxError("id not definedly!!")

    const db = this[type] as PouchDB.Database
    return new Promise((resolve, reject) => {
        this.queue.add_and_wait(type, async function readData() {
            return await db.find({
                selector: {_id: id}
            })
            .then(({ docs }) => {
                if (!docs.filter(doc => doc._id == id)[0]) resolve({})
                if (docs.length) {
                    return db.get(id)
                    .then((doc: any) => {
                        logger.debug({ type, id }, "read data from database")
                        resolve(doc)
                    })
                    .catch((e) => (errorHandler("get (read)", util.format(e), { type, id }), resolve({})))
                } else {
                    resolve({})
                }
            })
            .catch((e) => (errorHandler("find (read)", util.format(e), { type, id }), resolve({})))
        })
    })
}

async function exists(this: database.main, type: TDatabase, id: string): Promise<boolean> {
    if (!type) throw new SyntaxError("type not definedly!!")
    if (!id) throw new SyntaxError("id not definedly!!")

    const db = this[type] as PouchDB.Database
    return new Promise((resolve, reject) => {
        this.queue.add_and_wait(type, async function removeData() {
            return db.find({
                selector: {_id: id}
            })
            .then(({ docs }) => {
                if (docs.filter(doc => doc._id == id)[0]) resolve(true)
                else resolve(false)
            })
            .catch((e) => (errorHandler("find (find)", util.format(e), { type, id }), resolve(false)))
        })
    })
}

async function remove(this: database.main, type: TDatabase, id: string): Promise<any> {
    if (!type) throw new SyntaxError("type not definedly!!")
    if (!id) throw new SyntaxError("id not definedly!!")

    const db = this[type] as PouchDB.Database
    return new Promise((resolve, reject) => {
        this.queue.add_and_wait(type, async function removeData() {
            return db.find({
                selector: {_id: id}
            })
            .then(({ docs }) => {
                if (!docs.filter(doc => doc._id == id)[0]) resolve({})
                if (docs.length) {
                    return db.get(id)
                    .then((doc) => {
                        db.remove(doc._id, doc._rev)
                        .then(() => {
                            logger.debug({ type, id }, "remove data from " + type)
                            resolve(void 0)
                        })
                        .catch((e) => (errorHandler("remove", util.format(e), { type, id }), resolve({})))
                    })
                    .catch((e) => (errorHandler("remove get", util.format(e), { type, id }), resolve({})))
                } else {
                    resolve({})
                }
            })
            .catch((e) => (errorHandler("find", util.format(e), { type, id }), resolve({})))
        })
    })
}


function loaddb (name): database.main {
    checkandcreate()
    if (!fs.existsSync(path.join(DEFAULT_PATH_DATABASE, name))) { 
        throw new Error(`No found database with name: "${name}"`)
    }

    var auth = new PouchDB(path.join(DEFAULT_PATH_DATABASE, name, "auth")) 
    var config = new PouchDB(path.join(DEFAULT_PATH_DATABASE, name, "config")) 
    var users = new PouchDB(path.join(DEFAULT_PATH_DATABASE, name, "users")) 
    var groups = new PouchDB(path.join(DEFAULT_PATH_DATABASE, name, "groups")) 
    var response = new PouchDB(path.join(DEFAULT_PATH_DATABASE, name, "response")) 
    
    return {
        auth, config, users, groups, response, queue,
        write, exists, read, remove
    }
}

export {
    createdb as create,
    checkdb as check,
    deletedb as delete,
    renamedb as rename,
    loaddb as load
}