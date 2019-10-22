import { Client } from 'ghastly';
import YouTube from 'simple-youtube-api';
import Danbooru from 'danbooru';
import random from 'random-int';
import fs from 'fs';
import path from 'path';

import store from './store';

require('dotenv').config({ path: './.env' });
const { COMMAND_TRIGGERS, BOT_PREFIXES } = require('./util/constants');

const {
  BOT_PREFIX: prefix,
  BOT_TOKEN,
  YOUTUBE_API_KEY,
  DANBOORU_LOGIN,
  DANBOORU_API_KEY,
} = process.env;
const CACHED_MESSAGES_PATH = path.resolve(__dirname, '../.cached-messages');
const MESSAGE_LIMIT = 3000;
let messages = [];

try {
  const data = fs.readFileSync(CACHED_MESSAGES_PATH, 'utf8');
  const parsedMessages = JSON.parse(data);
  if (Array.isArray(parsedMessages)) {
    messages = parsedMessages;
  }
} catch (err) {
  console.log('Error reading cached messages');
} // eslint-disable-line

export const client = new Client({ prefix });

require('./services/mongo_connect');
require('./commands').default(client);

client.services.instance('music.youtube', new YouTube(YOUTUBE_API_KEY));
client.services.instance('music.store', store);
client.services.instance('danbooru', new Danbooru(`${DANBOORU_LOGIN}:${DANBOORU_API_KEY}`));

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

  const index = random(messages.length);

  if (message.isMentioned(client.user)) {
    const reply = messages[index] ? messages[index] : '<:CeceClownW:561235965197418498>';
    const emoji = client.emojis.random();

    messages.splice(index, 1);
    message.reply(`${reply} ${emoji}`);

    return;
  }

  if (messages.length > MESSAGE_LIMIT) {
    messages.splice(index, 1);
  }

  messages.push(message.content);
});

client.login(BOT_TOKEN);

setInterval(() => {
  fs.writeFile(CACHED_MESSAGES_PATH, JSON.stringify(messages), (err) => {
    if (err) console.error('Error writing cached messages');
  });
}, 5 * 60 * 1000);
