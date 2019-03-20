import { Client } from 'ghastly';
import YouTube from 'simple-youtube-api';

import store from './store';

require('dotenv').config({ path: './.env' });
const { COMMAND_TRIGGERS } = require('./util/constants');

const prefix = process.env.BOT_PREFIX;

const client = new Client({ prefix });

require('./services/mongo_connect');
require('./commands').default(client);

client.services.instance('music.youtube', new YouTube(process.env.YOUTUBE_API_KEY));
client.services.instance('music.store', store);

client.on('ready', () => {
  console.log('I\'m ready!');
  client.user.setGame(`${prefix}${COMMAND_TRIGGERS.HELP[0]}`);
});

client.on('dispatchFail', (reason, { error }) => {
  if (error) console.error(reason, error);
});

client.login(process.env.BOT_TOKEN);
