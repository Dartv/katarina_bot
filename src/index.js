import { Client } from 'ghastly';
import dotenv from 'dotenv';

import mongoConnect from './services/mongoConnect';
import initCommands from './commands';

dotenv.config({ path: './.env' });

const prefix = process.env.BOT_PREFIX;

const client = new Client({ prefix });

initCommands(client);
mongoConnect();

client.on('ready', () => {
  console.log('I\'m ready!');
  client.user.setGame(`${prefix}help`);
});

client.login(process.env.BOT_TOKEN);
