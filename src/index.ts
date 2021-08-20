// Starting point that checks for the environment variables

import consola, { Consola } from 'consola';
import Dotenv from 'dotenv';
import { MoeClient } from './clients/MoeClient';

Dotenv.config();

let initLogger: Consola = consola;

// Check if all required env variables are present
if (process.env.DISCORD_TOKEN == undefined) {
  initLogger.error('Missing DISCORD_TOKEN');
  process.exit(-1);
}

if (process.env.DATABASE_URL == undefined) {
  initLogger.error('Missing DATABASE_URL');
  process.exit(-1);
}

if (process.env.S3_ACCESS_KEY == undefined) {
  initLogger.error('Missing S3_ACCESS_KEY');
  process.exit(-1);
}

if (process.env.S3_BUCKET == undefined) {
  initLogger.error('Missing S3_BUCKET');
  process.exit(-1);
}

if (process.env.S3_ENDPOINT == undefined) {
  initLogger.error('Missing S3_ENDPOINT');
  process.exit(-1);
}

if (process.env.S3_REGION == undefined) {
  initLogger.error('Missing S3_REGION');
  process.exit(-1);
}

if (process.env.S3_SECRET_KEY == undefined) {
  initLogger.error('Missing S3_SECRET_KEY');
  process.exit(-1);
}

new MoeClient().start(process.env.DISCORD_TOKEN!);
