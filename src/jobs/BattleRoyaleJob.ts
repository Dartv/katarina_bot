import { Types } from 'mongoose';

import {
  Job,
  GuildDocument,
  Participant,
} from '../types';
import {
  Battle,
  BattleParticipant,
  User,
  UserCharacter,
} from '../models';
import { BattleStatus, BATTLE_ROYALE_WIN_CURRENCY } from '../utils/constants';
import { isTextChannel } from '../utils/discord-common';
import { createParticipantEmbed, fight } from '../utils/character';

const JOB_NAME = 'BATTLE_ROYALE';

export const BattleRoyaleJob: Job = (agenda, client) => {
  agenda.define(JOB_NAME, async (job, done) => {
    try {
      await Battle
        .find({ status: BattleStatus.IN_PROGRESS })
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

            const result = await BattleParticipant.aggregate<{ user: Types.ObjectId, userCharacter: Types.ObjectId }>([
              {
                $match: {
                  battle: battle._id,
                  isDefeated: false,
                },
              },
              { $sample: { size: 2 } },
              {
                $project: {
                  user: 1,
                  userCharacter: { $arrayElemAt: ['$characters', 0] },
                },
              },
            ]);
            const participants: Participant[] = await Promise.all(
              result.map(async ({ user: userId, userCharacter: userCharacterId }) => {
                const [user, userCharacter] = await Promise.all([
                  User.findOne({ _id: userId }),
                  UserCharacter.findOne({ _id: userCharacterId }).populate({
                    path: 'character',
                    populate: {
                      path: 'series',
                    },
                  }),
                ]);
                const author = await client.users.fetch(user.discordId);
                return {
                  user,
                  author,
                  userCharacter,
                };
              })
            );

            if (participants.length < 2) {
              const { user, author } = participants[0];

              user.currency += BATTLE_ROYALE_WIN_CURRENCY;
              await user.save();

              battle.set('status', BattleStatus.COMPLETED);

              return Promise.all([
                channel.send(`${author} received ${BATTLE_ROYALE_WIN_CURRENCY} 💎`),
                battle.save(),
              ]);
            }

            const [p1, p2] = participants;
            await channel.send('Starting new round...');
            await channel.send('', { embed: createParticipantEmbed(p1) });
            await channel.send('VS');
            await channel.send('', { embed: createParticipantEmbed(p2) });
            const [winner, loser] = fight(p1.userCharacter, p2.userCharacter) ? [p1, p2] : [p2, p1];
            await channel.send('The winner is...', { embed: createParticipantEmbed(winner) });
            return BattleParticipant.updateOne(
              { battle: battle._id, user: loser.user._id },
              {
                $set: {
                  isDefeated: true,
                },
              },
            );
          } catch (err) {
            battle.set('status', BattleStatus.FAILED);
            await battle.save();
            client.logger.error(err);
            return null;
          }
        });

      done();
    } catch (err) {
      job.fail(err);
      await job.save();
      done(err);
    }
  });

  agenda.every('* * * * *', JOB_NAME);
};
