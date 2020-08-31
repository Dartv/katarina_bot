import { Snowflake } from 'discord.js';

import { Plugin } from '../types';

const CHANNEL_IDS = ['362966121848111105', '557805526206119939', '620373848801411082'];
const THRESHOLD = 2;
const cache: Map<string, Snowflake[]> = new Map();

export const SpamMonitorPlugin: Plugin = (client) => {
  client.on('message', async (message) => {
    try {
      if (message.author.bot) {
        return;
      }

      if (CHANNEL_IDS.includes(message.channel.id)) {
        if (message.attachments.size) {
          return;
        }

        if (message.content.length) {
          const key = message.author.id;
          const ids = (cache.get(key) || []).concat(message.id);

          if (ids.length >= THRESHOLD) {
            cache.delete(key);
            await message
              .reply('please stop spamming in this channel 🚫')
              .then(m => client.setTimeout(() => m.delete(), 5000));
            await message.channel.bulkDelete(ids);
          } else {
            cache.set(key, ids);
          }
        }
      }
    } catch (err) {
      client.logger.error(err);
    }
  });

  client.setInterval(() => {
    cache.clear();
  }, 60000);
};
