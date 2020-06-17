import Agenda from 'agenda';
import { Client } from 'ghastly';
import { TextChannel } from 'discord.js';
import MarkdownFormatter from 'ghastly/lib/utils/MarkdownFormatter';

import { Character, WorldBoss, Guild } from '../models';
import { ChannelName, COMMAND_TRIGGERS } from '../util';

const JOB_NAME = 'world boss';

export default (agenda: Agenda, client: Client) => {
  agenda.define(JOB_NAME, async (job, done) => {
    const promises = client.channels
      .filter((channel) => channel instanceof TextChannel && channel.name === ChannelName.WORLD_BOSS_ARENA)
      .map(async (channel: TextChannel) => {
        const guild = await Guild.findOne({ discordId: channel.guild.id });
        if (guild) {
          const previous = await WorldBoss
            .findOne({ guild: guild._id })
            .sort({ createdAt: -1 });

          if (previous) {
            previous.completedAt = new Date();
            await previous.save();
          }

          const [character] = await Character.random(1);
          const boss = await new WorldBoss({
            guild: guild._id,
            character: character._id,
            hp: 0,
          }).save();
          const embed = await boss.embed();
          const command = MarkdownFormatter.code(`${client.dispatcher.prefix}${COMMAND_TRIGGERS.ATTACK[0]}`);
          await channel.send(
            `World Boss appears! Raise your weapons and attack with ${command}!`,
            { embed },
          );
        }
      });

    await Promise.all(promises);

    done();
  });

  agenda.every('0 6 * * *', JOB_NAME);
};
