import { Client } from 'ghastly';
import YouTube from 'simple-youtube-api';
import Danbooru from 'danbooru';
import random from 'random-int';
import fs from 'fs';
import path from 'path';
import MarkdownFormatter from 'ghastly/lib/utils/MarkdownFormatter';
import Snoowrap from 'snoowrap';

import { COMMAND_TRIGGERS, BOT_PREFIXES } from './util/constants';
import store from './store';
import { ICommandContext } from './types';
import { ErrorResponse } from './commands/responses';
import { connectDB } from './services/mongo_connect';
import installCommands from './commands';
import { logger } from './util/logger';

const {
  BOT_PREFIX: prefix,
  BOT_TOKEN,
  YOUTUBE_API_KEY,
  DANBOORU_LOGIN,
  DANBOORU_API_KEY,
  REDDIT_USERNAME,
  REDDIT_PASSWORD,
  REDDIT_CLIENT_ID,
  REDDIT_CLIENT_SECRET,
  REDDIT_USERAGENT,
} = process.env;
const CACHED_MESSAGES_PATH = path.resolve(__dirname, '../.cached-messages');
const MESSAGE_LIMIT = 3000;
const CECE_CLOWN_EMOTE = '<:CeceClownW:561235965197418498>';
let messages = [];

connectDB()
  .then(() => {
    process.send('ready');

    const client = new Client({ prefix });

    client.services.instance('music.youtube', new YouTube(YOUTUBE_API_KEY));
    client.services.instance('music.store', store);
    client.services.instance('danbooru', new Danbooru(`${DANBOORU_LOGIN}:${DANBOORU_API_KEY}`));
    client.services.instance(
      'reddit',
      new Snoowrap({
        userAgent: REDDIT_USERAGENT,
        clientId: REDDIT_CLIENT_ID,
        clientSecret: REDDIT_CLIENT_SECRET,
        username: REDDIT_USERNAME,
        password: REDDIT_PASSWORD,
      }),
    );

    client.on('ready', async () => {
      console.log('I\'m ready!');
      client.user.setActivity(`${prefix}${COMMAND_TRIGGERS.HELP[0]}`);
    });

    client.on('dispatchFail', (reason, context: ICommandContext) => {
      const { error, command } = context;
      if (error) {
        console.error(`Dispatch failed for command ${command}`);
        console.error(reason, error);
        if (reason === 'handlerError') {
          const response = ErrorResponse(
            'Something went wrong...',
            { ...context, formatter: MarkdownFormatter },
          );
          response.respond().catch(console.error);
        }
      }
    });

    installCommands(client);

    const botPrefixesRegex = new RegExp(`^[${BOT_PREFIXES.join('')}]`);
    const endsWithEmoteRegex = /(<:\w+:\d+>)$/;

    client.on('message', async (message) => {
      if (message.author.bot) return;

      if (message.content.startsWith(prefix)) return;

      if (botPrefixesRegex.test(message.content)) return;

      const index = random(messages.length);

      if (message.isMentioned(client.user)) {
        const reply = messages[index] ? messages[index] : CECE_CLOWN_EMOTE;
        const emoji = client.emojis.random();

        messages.splice(index, 1);
        await message.reply(`${reply.replace(endsWithEmoteRegex, '')} ${emoji}`);
        return;
      }

      if (messages.length > MESSAGE_LIMIT) {
        messages.splice(index, 1);
      }

      if (message.content) {
        messages.push(message.content);
      }
    });

    client.login(BOT_TOKEN);
  })
  .catch((err) => {
    logger.fatal('An error has occured while trying to connect to DB');
    logger.fatal(err);
    process.exit(1);
  });

try {
  const data = fs.readFileSync(CACHED_MESSAGES_PATH, 'utf8');
  const parsedMessages = JSON.parse(data);
  if (Array.isArray(parsedMessages)) {
    messages = parsedMessages;
  }
} catch (err) {
  console.log('Error reading cached messages');
} // eslint-disable-line

setInterval(() => {
  fs.writeFile(CACHED_MESSAGES_PATH, JSON.stringify(messages), (err) => {
    if (err) console.error('Error writing cached messages');
  });
}, 5 * 60 * 1000);
