import { Snowflake } from 'discord.js';

import { Plugin } from '../types';

const CHANNEL_IDS = ['362966121848111105', '557805526206119939', '620373848801411082'];
const THRESHOLD = 2;
const CLEAR_INTERVAL = 1 * 60 * 60 * 1000;
const cache: Map<Snowflake, Set<Snowflake>> = new Map();

export const SpamMonitorPlugin: Plugin = (client) => {
  client.on('message', async (message) => {
    try {
      if (message.author.bot) {
        return;
      }

      const key = message.channel.id;

      if (CHANNEL_IDS.includes(key)) {
        if (message.attachments.size || /https?/.test(message.content)) {
          return;
        }

        if (message.content.length) {
          if (!cache.has(key)) {
            cache.set(key, new Set());
          }

          const ids = cache.get(key);

          ids.add(message.id);

          if (ids.size >= THRESHOLD) {
            cache.delete(key);
            await message
              .reply('please stop spamming in this channel 🚫')
              .then(msg => client.setTimeout(() => msg.delete(), 5000));
            await message.channel.bulkDelete(Array.from(ids));
          }
        }
      }
    } catch (err) {
      client.logger.error(err);
    }
  });

  client.setInterval(() => {
    cache.clear();
  }, CLEAR_INTERVAL);
};
