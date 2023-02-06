import { MarkdownFormatter } from 'diskat';

import { GuildSetting, Trigger } from '../utils/constants';
import { Guild, Boss } from '../models';
import { Job } from '../types';
import { isTextChannel } from '../utils/discord-common';

const JOB_NAME = 'world boss';

export const BossJob: Job = (agenda, client) => {
  agenda.define(JOB_NAME, async (job, done) => {
    done();

    try {
      const cursor = Guild.find(
        { [`settings.${GuildSetting.BOSS_CHANNEL}`]: { $ne: null } },
        { _id: 1, [`settings.${GuildSetting.BOSS_CHANNEL}`]: 1 },
      ).cursor();
      await cursor.eachAsync(async (guild) => {
        const { settings: { bossChannel } } = guild;
        const channel = client.channels.cache.get(bossChannel);

        if (isTextChannel(channel)) {
          const boss = await Boss.spawn(guild._id);
          const embed = boss.getEmbed();
          const command = MarkdownFormatter.code(`${client.dispatcher.prefix}${Trigger.ATTACK[0]}`);
          await channel.send(
            `World Boss appears! Raise your weapons and attack by typing ${command}`,
            { embed },
          );
          await boss.save();
        } else {
          console.warn(`boss channel ${bossChannel} of guild ${guild._id} not found`);
        }
      });
    } catch (err) {
      job.fail(err);
      await job.save();
    }
  });

  agenda.every('0 6 * * *', JOB_NAME);
};
