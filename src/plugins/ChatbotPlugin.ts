import { Client } from 'ghastly';
import random from 'random-int';
import path from 'path';
import fs from 'fs';

import { BOT_PREFIXES } from '../util';

export const ChatbotPlugin = (client: Client) => {
  const MESSAGE_LIMIT = 3000;
  const CECE_CLOWN_EMOTE = '<:CeceClownW:561235965197418498>';
  const botPrefixesRegex = new RegExp(`^[${BOT_PREFIXES.join('')}]`);
  const endsWithEmoteRegex = /(<:\w+:\d+>)$/;
  const CACHED_MESSAGES_PATH = path.resolve(__dirname, '../../.cached-messages');
  let messages = [];

  client.on('message', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith(client.dispatcher.prefix)) return;

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

  try {
    const data = fs.readFileSync(CACHED_MESSAGES_PATH, 'utf8');
    const parsedMessages = JSON.parse(data);
    if (Array.isArray(parsedMessages)) {
      messages = parsedMessages;
    }
  } catch (err) {
    console.log('Error reading cached messages');
    console.error(err);
  } // eslint-disable-line

  setInterval(() => {
    fs.writeFile(CACHED_MESSAGES_PATH, JSON.stringify(messages), (err) => {
      if (err) console.error('Error writing cached messages');
      console.error(err);
    });
  }, 5 * 60 * 1000);
};
