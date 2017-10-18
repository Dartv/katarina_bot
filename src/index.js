import { Client } from 'ghastly';

import { COMMAND_TRIGGERS } from './util/constants';

require('dotenv').config({ path: './.env' });

const prefix = process.env.BOT_PREFIX;

const client = new Client({ prefix });

require('./services/mongo_connect');
require('./commands').default(client);

client.on('ready', () => {
  console.log('I\'m ready!');
  client.user.setGame(`${prefix}${COMMAND_TRIGGERS.HELP[0]}`);
});

client.on('dispatchFail', (reason, { error }) => {
  if (error) console.error(error);
});

client.login(process.env.BOT_TOKEN);
