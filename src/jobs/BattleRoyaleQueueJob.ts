import { MarkdownFormatter } from 'diskat';
import { subMinutes } from 'date-fns';

import { Job, GuildDocument, UserDocument } from '../types';
import { Battle, BattleParticipant } from '../models';
import {
  BattleStatus,
  BattleType,
  BATTLE_ROYALE_QUEUE_TIME_IN_MINUTES,
} from '../utils/constants';
import { isTextChannel } from '../utils/discord-common';

const JOB_NAME = 'BATTLE_ROYALE_QUEUE';

export const BattleRoyaleQueueJob: Job = (agenda, client) => {
  agenda.define(JOB_NAME, async (job, done) => {
    try {
      await Battle
        .find({
          status: BattleStatus.WAITING,
          type: BattleType.ROYALE,
          createdAt: {
            $lte: subMinutes(new Date(), BATTLE_ROYALE_QUEUE_TIME_IN_MINUTES),
          },
        })
        .populate('guild')
        .cursor()
        .eachAsync(async (battle) => {
          try {
            const guild = client.guilds.cache.get((battle.guild as GuildDocument).discordId);

            if (!guild) {
              throw new Error(`No guild found for battle ${battle.id}`);
            }

            const channel = guild.channels.cache.get((battle.guild as GuildDocument).settings.royaleChannel);

            if (!isTextChannel(channel)) {
              throw new Error(`No channel found for battle ${battle.id}`);
            }

            const participants = await BattleParticipant.find({ battle: battle._id }).populate('user').limit(24);
            if (participants.length > 1) {
              const discordIds = participants.map(({ user }) => (user as UserDocument).discordId);
              const members = await guild.members.fetch({ user: discordIds });
              const names = members.map((member) => member.displayName).concat(participants.length > 24 ? '...' : []);

              await channel.send(
                'Lobby is closed! Round starts shortly.\n'
                + `${MarkdownFormatter.bold('Participants')}: ${names.join(', ')}`
              );

              battle.set('status', BattleStatus.IN_PROGRESS);
              await battle.save();
            }
          } catch (err) {
            battle.set('status', BattleStatus.FAILED);
            await battle.save();
            client.logger.error(err);
          }
        });

      done();
    } catch (err) {
      job.fail(err);
      await job.save();
      done(err);
    }
  });

  agenda.every('1 minute', JOB_NAME);
};
