import path from 'path';
import fs from 'fs';

import { Plugin } from '../types';
import { randomInt } from '../utils/common';

export const BOT_PREFIXES = [
  '!',
  '$',
  '%',
  '^',
  '&',
  '*',
  '|',
  ',',
  '.',
  '=',
  '?',
];

export const ChatbotPlugin: Plugin = (client) => {
  const MESSAGE_LIMIT = 3000;
  const botPrefixesRegex = new RegExp(`^[${BOT_PREFIXES.join('')}]`);
  const endsWithEmoteRegex = /(<:\w+:\d+>)$/;
  const CACHED_MESSAGES_PATH = path.resolve(__dirname, '../../.cached-messages');
  let messages = [];

  client.on('message', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith(client.dispatcher.prefix as string)) return;

    if (botPrefixesRegex.test(message.content)) return;

    if (message.guild === null) return;

    if (message.guild.id !== '557804417550909440') return;

    const index = randomInt(0, messages.length);

    if (message.mentions.has(client.user)) {
      if (!messages.length) return;

      const reply = messages[index];

      if (!reply) return;

      const emoji = client.emojis.cache.random();

      messages.splice(index, 1);
      await message.reply(`${reply.replace(endsWithEmoteRegex, '')} ${emoji}`);
      return;
    }

    if (messages.length > MESSAGE_LIMIT) {
      messages.splice(index, 1);
    }

    if (message.content.split(' ').length < 2) return;

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
    client.logger.error('Error reading cached messages');
    client.logger.error(err);
  }

  setInterval(() => {
    fs.writeFile(CACHED_MESSAGES_PATH, JSON.stringify(messages), (err) => {
      if (err) {
        client.logger.error('Error writing cached messages');
        client.logger.error(err);
      }
    });
  }, 5 * 60 * 1000);
};
