import { ICommand, ICommandHandler, Middleware } from 'ghastly';
import {
  Message,
  Collection,
  GuildMember,
  RichEmbed,
} from 'discord.js';

import { COMMAND_TRIGGERS, RewardTable, MissionCode } from '../util';
import { injectUser, withMission } from './middleware';
import { IMission } from '../models/mission/types';
import { getDailyResetDate } from '../util/daily';
import { User, Character } from '../models';
import { ErrorResponse } from './responses/ErrorResponse';
import { IUser } from '../models/user/types';
import { createCharacterEmbed } from '../models/character/util';
import { ICharacter } from '../models/character/types';

enum Answer {
  YES = 'yes',
  NO = 'no',
}

export interface IParticipant {
  user: IUser;
  character: ICharacter;
  member: GuildMember;
  message: Message;
}

const middleware: Middleware[] = [
  injectUser(),
  withMission(async () => ({
    code: MissionCode.DUEL,
    reward: RewardTable.DUEL,
    update: async (mission, res): Promise<IMission> => {
      if (typeof res === 'string') {
        Object.assign(mission, {
          resetsAt: getDailyResetDate(),
          completedAt: new Date(),
        });
      }

      return mission;
    },
  })),
];

export const chooseCharacter = async (
  {
    user,
    message,
    attempt = 1,
    lastCharacter,
  }: {
    user: IUser;
    message: Message;
    attempt?: number;
    lastCharacter?: ICharacter;
  },
): Promise<ICharacter> => {
  if (attempt >= 5) return lastCharacter;

  const [character] = await Character.random(1, [
    {
      $match: {
        _id: {
          $in: user.characters,
        },
      },
    },
  ]);
  await message.author.send(
    'Do you want to pick this character? Type "yes" or "no"',
    { embed: createCharacterEmbed(character) },
  );

  let answer: Answer;

  try {
    const collectedMessages = await message.author.dmChannel.awaitMessages(
      ({ content }: Message) => Object.values(Answer).includes(content.trim().toLowerCase() as Answer),
      {
        maxMatches: 1,
        time: 10000,
        errors: ['time'],
      },
    );
    answer = collectedMessages.first().content.trim().toLowerCase() as Answer;
  } catch {
    return character;
  }

  if (answer === Answer.YES) {
    return character;
  }

  return chooseCharacter({
    user,
    message,
    attempt: attempt + 1,
    lastCharacter: character,
  });
};

export const createParticipantEmbed = (
  participant: IParticipant,
): RichEmbed => createCharacterEmbed(participant.character)
  .setAuthor(participant.member.displayName, participant.member.user.avatarURL)
  .setThumbnail(participant.character.imageUrl)
  .setImage(null);


const handler: ICommandHandler = async (context): Promise<any> => {
  const { user, message, dispatch } = context;
  const member = message.mentions.members.first();

  if (member.id === user.id) {
    return new ErrorResponse('You can\'t duel yourself!', context);
  }

  if (user.characters.length < 10) {
    return new ErrorResponse('You should have at least 10 characters', context);
  }

  if (member) {
    const opponent = await User.findOne({ discordId: member.id });

    if (!opponent || opponent.characters.length < 10) {
      return new ErrorResponse(
        'You should have at least 10 characters',
        { ...context, message: { ...message, author: member.user } },
      );
    }

    await dispatch('Place your bets!');

    let collectedMessages: Collection<string, Message>;

    try {
      collectedMessages = await message.channel.awaitMessages(
        ({ content, author }: Message, store: Collection<string, Message>) => {
          const bet = Number(content.trim());

          if (!Number.isInteger(bet)) return false;

          const player = [user, opponent].find(({ discordId }) => discordId === author.id);

          if (!player || player.currency < bet) return false;

          if (store.some((msg) => msg.author.id === author.id)) return false;

          return true;
        },
        {
          maxMatches: 2,
          time: 15000,
          errors: ['time'],
        }
      );
    } catch {
      return new ErrorResponse('Some player did not make a bet or does not have enough 💎', context);
    }

    const promises = collectedMessages.map(async (msg) => {
      const player: IUser = [user, opponent].find(({ discordId }) => discordId === msg.author.id);
      await msg.author.send('I\'ll give you 5 choices, pick wisely');
      const character = await chooseCharacter({
        user: player,
        message: msg,
      });
      return {
        user: player,
        character,
        member: msg.member,
        message: msg,
      };
    });

    const players = await Promise.all(promises);

    await dispatch(createParticipantEmbed(players[0]));
    await dispatch('VS');
    await dispatch(createParticipantEmbed(players[1]));

    const [winner, loser] = [...players].sort((p1, p2) => p1.character.popularity - p2.character.popularity);
    const [winnerBet, loserBet] = [winner, loser].map((player) => Number(player.message.content.trim()));
    const prize = winnerBet + loserBet;

    winner.user.currency += loserBet;
    loser.user.currency -= loserBet;

    await Promise.all([
      winner.user.save(),
      loser.user.save(),
    ]);

    return `${winner.member} has beaten ${loser.member} to death and won ${prize}💎`;
  }

  return null;
};

export default (): ICommand => ({
  handler,
  middleware,
  parameters: [
    {
      name: 'user',
      description: 'user mention',
    },
  ],
  triggers: COMMAND_TRIGGERS.DUEL,
  description: 'Battle for the glory and katacoins!',
});
