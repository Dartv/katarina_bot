import { TextChannel } from 'discord.js';
import { MarkdownFormatter } from 'diskat';

import { ChannelName, Trigger } from '../utils/constants';
import { Guild, Boss, Character } from '../models';
import { createBossEmbed } from '../utils/character';
import { Job } from '../types';
import { isTextChannel } from '../utils/discord-common';

const JOB_NAME = 'world boss';

export const BossJob: Job = (agenda, client) => {
  agenda.define(JOB_NAME, async (job, done) => {
    try {
      const promises = client.channels.cache
        .filter((channel) => isTextChannel(channel) && channel.name === ChannelName.WORLD_BOSS_ARENA)
        .map(async (channel: TextChannel) => {
          const guild = await Guild.findOne({ discordId: channel.guild.id });
          if (guild) {
            const previous = await Boss
              .findOne({ guild: guild._id })
              .sort({ createdAt: -1 });

            if (previous) {
              previous.endedAt = new Date();
              await previous.save();
            }

            const [character] = await Character.random(1);
            const boss = new Boss({
              guild: guild._id,
              character: character._id,
            });
            await boss.populate({
              path: 'character',
              populate: {
                path: 'series',
              },
            }).execPopulate();
            const embed = createBossEmbed(boss);
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

  // agenda.every('0 6 * * *', JOB_NAME);
  agenda.now(JOB_NAME);
};
