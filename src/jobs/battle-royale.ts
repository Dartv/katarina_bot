/* eslint-disable no-await-in-loop */

import Agenda from 'agenda';
import { Client, ICommandContext } from 'ghastly';
import {
  TextChannel,
  Message,
} from 'discord.js';
import MarkdownFormatter from 'ghastly/lib/utils/MarkdownFormatter';

import { User, Character } from '../models';
import {
  shuffle,
  sleep,
  MissionCode,
  RewardTable,
} from '../util';
import { IUser } from '../models/user/types';
import { withMission } from '../commands/middleware';
import { getDailyResetDate } from '../util/daily';
import { IMission } from '../models/mission/types';
import { IParticipant, createParticipantEmbed } from '../commands/duel';

const JOB_NAME = 'waifu royale';
const CHANNEL_NAME = 'waifu-royale';
const QUEUE_TIME = 600000;
const INTERVAL_BETWEEN_ROUNDS = 1 * 60 * 1000;
const CURRENCY = 100;

const completeBattleRoyaleMission = async (user: IUser, message: Message, client: Client): Promise<void> => {
  const middleware = withMission(async () => ({
    code: MissionCode.BATTLE_ROYALE,
    reward: RewardTable.BATTLE_ROYALE,
    update: async (mission): Promise<IMission> => {
      Object.assign(mission, {
        resetsAt: getDailyResetDate(),
        completedAt: new Date(),
      });
      return mission;
    },
  }));
  const context = {
    user,
    message,
    dispatch: (response) => client.dispatcher.dispatchResponse(message.channel, response),
    formatter: MarkdownFormatter,
  } as ICommandContext;

  await middleware(() => null, context);
};

const battleRoyale = async (channel: TextChannel, bracket: IParticipant[]): Promise<IParticipant> => {
  if (bracket.length === 1) return bracket[0];

  const [p1, p2, ...rest] = shuffle(bracket);
  await channel.send('Starting new round...');
  await channel.send(createParticipantEmbed(p1));
  await channel.send('VS');
  await channel.send(createParticipantEmbed(p2));
  await sleep(10000);
  const [winner] = [p1, p2].sort((a, b) => a.character.popularity - b.character.popularity);
  await channel.send('The winner is...', { embed: createParticipantEmbed(winner) });
  await sleep(INTERVAL_BETWEEN_ROUNDS);
  return battleRoyale(channel, [winner, ...rest]);
};

export default (agenda: Agenda, client: Client) => {
  agenda.define(JOB_NAME, async (job, done) => {
    try {
      const promises = client.channels
        .filter((channel: TextChannel) => channel.name === CHANNEL_NAME)
        .map(async (channel: TextChannel) => {
          channel.send(
            'Waifu Royale round is starting! Type "enter" to participate.\n\n'
            + '**To participate you should have at least 10 characters**'
          );
          const messages = await channel.awaitMessages(
            (message: Message) => message.content.toLowerCase().startsWith('enter'),
            {
              time: QUEUE_TIME,
            },
          );
          const uniqueMessages = messages
            .array()
            .filter((message, i, arr) => {
              const index = arr.findIndex(v => v.author.id === message.author.id);
              return i === index;
            });
          const participants: IParticipant[] = await Promise.all(
            uniqueMessages.map(async (message) => {
              const user = await User.findOne({ discordId: message.author.id });
              const length = user?.characters?.length || 0;

              if (length < 10) return null;

              const [character] = await Character.random(1, [
                {
                  $match: {
                    _id: {
                      $in: user.characters,
                    },
                  },
                },
              ]);

              await completeBattleRoyaleMission(user, message, client);

              return {
                user,
                character,
                member: message.member,
                message,
              };
            }),
          ).then(p => p.filter(Boolean));

          const participantNames = participants.map(participant => participant.member.displayName).join(', ');
          await channel.send(
            `Lobby is closed! Participants are: ${participantNames}`
          );
          await sleep(5000);

          if (participants.length < 2) {
            return channel.send('Not enough participants!');
          }

          const winner = await battleRoyale(channel, participants);
          await channel.send(`Congratulations to ${winner.member.displayName} for winning Waifu Battle Royale!`);
          await channel.send(createParticipantEmbed(winner));
          winner.user.currency += CURRENCY;
          winner.user.save();
          return channel.send(`${winner.member.user} received ${CURRENCY}💎`);
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

  agenda.every('0 * * * *', JOB_NAME);
};
