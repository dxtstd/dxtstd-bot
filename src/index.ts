import Database from './database.ts';
import AuthState from './auth.ts';
import LoggerDefault from './logger.ts';

import * as baileys from 'baileys';
import pino from 'pino';
import qrcode from "qrcode-terminal"

class Bot {
  public sock: baileys.WASocket;

  public db: Map<string, Database>;
  public authState: AuthState;
  public logger: pino.Logger;

  constructor(opts?) {
    this.logger = LoggerDefault.child({ system: 'bot' });
  }

  async load() {
    this.authState = new AuthState();
    this.logger.info('load auth state for baileys...');
    await this.authState.load();
  }

  async startConnection() {
    return this.load().then(async () => {
      this.sock = baileys.makeWASocket({
        auth: this.authState.CredsKeysForAuthBaileys().state,
        version: (await baileys.fetchLatestBaileysVersion()).version,
        browser: baileys.Browsers.windows('Chrome'),
        logger: this.logger.child({ system: "bot.sock" }),
        mobile: false,
        qrTimeout: 60000,
        markOnlineOnConnect: true,
        syncFullHistory: false,
        shouldSyncHistoryMessage: () => false,
      });

      this.sock.ev.on("connection.update", async (args) => {
        const {connection, lastDisconnect, qr } = args

        if (qr) {
          qrcode.generate(qr, {small: true})
        }

        if (connection == "close") {
          const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== 401

          if (!shouldReconnect) {
            this.logger.info("session unauthorized (401), close connection...")
          } else {
            this.logger.info("close connection...")
            await this.authState.saveCreds()
            this.startConnection()
          }
        }
      })
    });
  }
}

const bot = new Bot()
bot.startConnection()