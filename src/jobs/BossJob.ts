import { TextChannel } from 'discord.js';
import { MarkdownFormatter } from 'diskat';

import { ChannelName, Trigger } from '../utils/constants';
import { Guild, Boss } from '../models';
import { Job } from '../types';
import { isTextChannel } from '../utils/discord-common';

const JOB_NAME = 'world boss';

export const BossJob: Job = (agenda, client) => {
  agenda.define(JOB_NAME, async (job, done) => {
    try {
      const promises = client.channels.cache
        // TODO: get channels from guild settings
        .filter((channel) => isTextChannel(channel) && channel.name === ChannelName.WORLD_BOSS_ARENA)
        .map(async (channel: TextChannel) => {
          const guild = await Guild.findOne({ discordId: channel.guild.id });
          if (guild) {
            const boss = await Boss.spawn(guild._id);
            const embed = boss.getEmbed();
            const command = MarkdownFormatter.code(`${client.dispatcher.prefix}${Trigger.ATTACK[0]}`);
            await channel.send(
              `World Boss appears! Raise your weapons and attack by typing ${command}`,
              { embed },
            );
            await boss.save();
          }
        });

      await Promise.all(promises);
      done();
    } catch (err) {
      job.fail(err);
      await job.save();
      done(err);
    }
  });

  agenda.every('0 6 * * *', JOB_NAME);
};
