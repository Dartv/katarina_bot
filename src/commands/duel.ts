import {
  ICommand, ICommandHandler, Middleware, ICommandContext,
} from 'ghastly';
import {
  Message,
  GuildMember,
  RichEmbed,
  User as DiscordUser,
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

const withDuelMission = (
  config: (context: ICommandContext) => Promise<{ user?: IUser; discordUser?: DiscordUser }>,
): Middleware => withMission(async (context) => ({
  ...await config(context),
  code: MissionCode.DUEL,
  reward: RewardTable.DUEL,
  update: async (mission): Promise<IMission> => {
    Object.assign(mission, {
      resetsAt: getDailyResetDate(),
      completedAt: new Date(),
    });

    return mission;
  },
}));

const middleware: Middleware[] = [
  injectUser(),
  withDuelMission(async (context) => {
    const member = context.message.mentions.members.first();
    const user = await User.findOne({ discordId: member.id });

    return { user, discordUser: member.user };
  }),
  withDuelMission(async (context) => ({
    user: context.user,
    discordUser: context.message.author,
  })),
];

export const chooseCharacter = async (
  {
    user,
    message,
    attempt = 0,
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

  character.awaken(user);

  await message.author.send(
    'Do you want to pick this character? Type "yes" or "no"',
    { embed: createCharacterEmbed(character.toObject()) },
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
): RichEmbed => createCharacterEmbed(participant.character.toObject())
  .setAuthor(participant.member.displayName, participant.member.user.avatarURL)
  .setThumbnail(participant.character.imageUrl)
  .setImage(null);

const handler: ICommandHandler = async (context): Promise<any> => {
  const {
    user,
    message,
    dispatch,
    args,
  } = context;
  const bet = Number(args.bet.trim());
  const member = message.mentions.members.first();

  if (!Number.isInteger(bet)) {
    return new ErrorResponse(`${args.bet} is not a valid bet`, context);
  }

  if (!member) {
    return new ErrorResponse('You need to @mention someone', context);
  }

  if (bet < 50) {
    return new ErrorResponse('Minimum bet is 50💎', context);
  }

  if (member.id === user.id) {
    return new ErrorResponse('You can\'t duel yourself!', context);
  }

  if (user.characters.length < 10 || user.currency < bet) {
    return new ErrorResponse(`You should have at least 10 characters and ${bet}💎`, context);
  }

  const opponent = await User.findOne({ discordId: member.id });

  if (!opponent || opponent.characters.length < 10 || opponent.currency < bet) {
    return new ErrorResponse(
      `${member.displayName} doesn't have 10 characters or enough 💎`,
      context,
    );
  }

  const participants = [
    {
      user,
      member: message.member,
      message,
    },
  ];

  await dispatch(`${member} accept duel by typing "yes"`);

  try {
    const collectedMessages = await message.channel.awaitMessages(
      ({ content, author }: Message) => content.trim().toLowerCase() === 'yes' && author.id === member.id,
      {
        maxMatches: 1,
        time: 20000,
        errors: ['time'],
      }
    );
    const collectedMessage = collectedMessages.first();
    participants.push({
      user: opponent,
      member: collectedMessage.member,
      message: collectedMessage,
    });
  } catch {
    return new ErrorResponse(`${member.displayName} didn't accept`, context);
  }

  const promises = participants.map(async (participant) => {
    await participant.member.user.send('I\'ll give you 5 choices, pick wisely');
    const character = await chooseCharacter({
      user: participant.user,
      message: participant.message,
    });
    return {
      character,
      user: participant.user,
      member: participant.member,
      message: participant.message,
    };
  });

  const players = await Promise.all(promises);

  await dispatch(createParticipantEmbed(players[0]));
  await dispatch('VS');
  await dispatch(createParticipantEmbed(players[1]));

  const [winner, loser] = [...players].sort(
    (p1, p2) => p1.character.fight(p2.character) ? -1 : 1
  );
  const prize = bet * 2;

  winner.user.currency += bet;
  loser.user.currency -= bet;

  await Promise.all([
    winner.user.save(),
    loser.user.save(),
  ]);

  return `${winner.member} has beaten ${loser.member} to death and won ${prize}💎`;
};

export default (): ICommand => ({
  handler,
  middleware,
  parameters: [
    {
      name: 'user',
      description: 'user mention',
    },
    {
      name: 'bet',
      description: 'bet amount',
    },
  ],
  triggers: COMMAND_TRIGGERS.DUEL,
  description: 'Battle for the glory and katacoins!',
});
