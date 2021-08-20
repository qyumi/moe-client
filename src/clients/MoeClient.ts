// The main Discord client that gets passed around the whole project

import consola, { Consola } from 'consola';
import Glob from 'glob';
import { Client, Collection, Intents } from 'discord.js';
import { promisify } from 'util';
import { Event } from '../interfaces/Event';
import S3Client from './S3Client';
import mongoose from 'mongoose';

const GlobPromise = promisify(Glob);

class MoeClient extends Client {
  public logger: Consola = consola;
  public events: Collection<string, Event> = new Collection();
  public s3client: S3Client = new S3Client();

  constructor() {
    super({
      messageCacheMaxSize: 0,
      messageCacheLifetime: 0,
      fetchAllMembers: true,
      ws: {
        intents: Intents.ALL,
      },
      partials: ['MESSAGE'],
    });
  }

  public async start(token: string): Promise<void> {
    this.logger.info("Connecting to Discord...")
    await this.login(token);
    this.logger.info("Connecting to MongoDB..");
    await mongoose.connect(process.env.DATABASE_URL!, { useNewUrlParser: true, useUnifiedTopology: true });
    this.logger.info("CONNECTED");

    
    // Register basic events from src/events/..
    const EventFiles: string[] = await GlobPromise(`${__dirname}/../events/*.js`);
    EventFiles.map(async (value: string) => {
      const file: Event = await import(value);
      this.events.set(file.name, file);
      this.on(file.name, file.run.bind(null, this));
    });

    // Register message events from src/events/message/..
    const MessageEventFiles: string[] = await GlobPromise(`${__dirname}/../events/message/*.js`);
    MessageEventFiles.map(async (value: string) => {
      const file: Event = await import(value);
      this.events.set(file.name, file);
      this.on(file.name, file.run.bind(null, this));
    });

    // Register live events from src/events/live/..
    const LiveEventFiles: string[] = await GlobPromise(`${__dirname}/../events/live/*.js`);
    LiveEventFiles.map(async (value: string) => {
      const file: Event = await import(value);
      this.events.set(file.name, file);
      this.on(file.name, file.run.bind(null, this));
    });
  }
}

export { MoeClient };
