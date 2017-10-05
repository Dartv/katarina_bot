import { Client } from 'ghastly';

require('dotenv').config({ path: './.env' });

const prefix = process.env.BOT_PREFIX;

const client = new Client({ prefix });

require('./services/mongo_connect');
require('./commands').default(client);

client.on('ready', () => {
  console.log('I\'m ready!');
  client.user.setGame(`${prefix}help`);
});

client.on('dispatchFail', (context, error) => {
  console.error(error);
});

client.login(process.env.BOT_TOKEN);
