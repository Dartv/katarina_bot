import Agenda from 'agenda';
import { Client } from 'ghastly';
import { TextChannel, Message } from 'discord.js';

import { handler } from '../commands/whatseries';
import { User } from '../models';

const JOB_NAME = 'waifu quiz';
const CHANNEL_NAME = 'waifu-quiz';
const CURRENCY = 5;

export default (agenda: Agenda, client: Client) => {
  agenda.define(JOB_NAME, async (job, done) => {
    try {
      const promises = client.channels
        .filter((channel: TextChannel) => channel.name === CHANNEL_NAME)
        .map(async (channel: TextChannel) => {
          const prevMessages = await channel.fetchMessages({ limit: 49 });
          const [message]: [Message, any] = await Promise.all([
            handler({
              dispatch: channel.send.bind(channel),
              message: { channel },
              args: {},
              clearCooldown: () => null,
            } as any),
            await channel.bulkDelete(prevMessages),
          ]);

          const member = message.mentions.members.first();
          if (member) {
            const user = await User.findOne({ discordId: member.id });
            if (user) {
              user.currency += CURRENCY;
              user.correctQuizGuesses += 1;
              await user.save();
              await channel.send(`${member} received ${CURRENCY}💎`);
            }
          }
        });
      await Promise.all(promises);
    } catch (err) {
      console.error(`Failed job ${JOB_NAME}`);
      console.error(err);
      job.fail(err);
      await job.save();
    }

    done();
  });

  agenda.every('30 seconds', JOB_NAME);
};
