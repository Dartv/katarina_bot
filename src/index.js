import { Client } from 'ghastly';
import YouTube from 'simple-youtube-api';

import store from './store';

require('dotenv').config({ path: './.env' });
const { COMMAND_TRIGGERS, BOT_PREFIXES } = require('./util/constants');

const prefix = process.env.BOT_PREFIX;
const messages = [];

const client = new Client({ prefix });

require('./services/mongo_connect');
require('./commands').default(client);

client.services.instance('music.youtube', new YouTube(process.env.YOUTUBE_API_KEY));
client.services.instance('music.store', store);

client.on('ready', () => {
  console.log('I\'m ready!');
  client.user.setActivity(`${prefix}${COMMAND_TRIGGERS.HELP[0]}`);
});

client.on('dispatchFail', (reason, { error }) => {
  if (error) console.error(reason, error);
});

const BOT_PREFIXES_REGEX = new RegExp(`^[${BOT_PREFIXES.join('')}]`);

client.on('message', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith(prefix)) return;

  if (BOT_PREFIXES_REGEX.test(message.content)) return;

  const index = Math.floor(Math.random() * messages.length);

  if (message.isMentioned(client.user)) {
    const reply = messages[index];
    const emoji = client.emojis.random();

    messages.splice(index, 1);
    message.reply(`${reply} ${emoji}`);

    return;
  }

  if (messages.length > 999) {
    // remove random batch of messages to free up memeory
    messages.splice(index, 100);
  }

  messages.push(message.content);
});

client.login(process.env.BOT_TOKEN);
