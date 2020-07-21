import { Command, Middleware } from 'diskat';
import { GuildMember } from 'discord.js';
import { Types } from 'mongoose';

import {
  UserDocument,
  Context,
  InjectUserMiddlewareContext,
  Participant,
} from '../../types';
import { Trigger, ParameterType, CommandGroupName } from '../../utils/constants';
import { injectUser, withInMemoryCooldown } from '../middleware';
import { ErrorResponse } from '../responses';
import { battle, pickCharacter, createParticipantEmbed } from '../../utils/character';
import { awaitAnswer } from '../../utils/discord-common';

export interface DuelCommandContext extends Context {
  user: UserDocument;
  opponent: UserDocument;
  args: {
    member: GuildMember;
    bet: number;
  };
}

export type InjectOpponentMiddlewareContext = Context & Pick<DuelCommandContext, 'opponent'>;

export const injectOpponent = (): Middleware<InjectUserMiddlewareContext, InjectOpponentMiddlewareContext> => async (
  next,
  { user, ...context },
) => next({
  ...context,
  opponent: user,
});

export const validateUsers = (): Middleware<DuelCommandContext, DuelCommandContext> => async (next, context) => {
  const { opponent, user, args } = context;

  if (args.bet < 50) {
    return new ErrorResponse(context, 'Minimum bet amount is 50 💎');
  }

  if (opponent.id === user.id) {
    return new ErrorResponse(context, 'Cannot duel yourself');
  }

  if (user.currency < args.bet) {
    return new ErrorResponse(context, 'You don\'t have enough 💎');
  }

  if (opponent.currency < args.bet) {
    return new ErrorResponse(context, `${args.member.displayName} doesn't have enough 💎`);
  }

  return next(context);
};

const DuelCommand: Command<DuelCommandContext> = async (context): Promise<any> => {
  const {
    user,
    args,
    dispatch,
    message,
    opponent,
  } = context;

  await dispatch(`${args.member} accept the duel by typing "accept"`);

  const collectedMessage = await awaitAnswer(
    args.member.user,
    message.channel,
    {
      correct: ['accept'],
      incorrect: ['no'],
      time: 20000,
    },
  );

  if (!collectedMessage) {
    return new ErrorResponse(context, `${args.member.displayName} didn't accept the duel`);
  }

  const players: Omit<Participant, 'userCharacter'>[] = [
    { user, author: message.author },
    { user: opponent, author: collectedMessage.author },
  ];

  const promises = players.map(async (participant) => {
    await participant.author.send('I\'ll give you 5 choices. Pick wisely!');
    const userCharacter = await pickCharacter(participant.user, participant.author);
    return {
      ...participant,
      userCharacter,
    };
  });
  const participants: Participant[] = await Promise.all(promises);

  await dispatch(createParticipantEmbed(participants[0]));
  await dispatch('VS');
  await dispatch(createParticipantEmbed(participants[1]));

  const [winner, loser] = battle(participants.map(p => p.userCharacter))
    .map((userCharacter) => participants.find(p => p.user._id.equals(userCharacter.user as Types.ObjectId)));
  const prize = args.bet * 2;

  winner.user.currency += args.bet;
  loser.user.currency -= args.bet;

  await Promise.all([
    winner.user.save(),
    loser.user.save(),
  ]);

  return `${winner.author} has beaten ${loser.author} and won ${prize}`;
};

DuelCommand.config = {
  triggers: Trigger.DUEL,
  description: 'Battle for glory and 💎',
  parameters: [
    {
      name: 'member',
      description: 'user',
      type: ParameterType.MEMBER,
    },
    {
      name: 'bet',
      description: 'bet amount',
      type: ParameterType.NUMBER,
    },
  ],
  group: CommandGroupName.GACHA,
  middleware: [
    injectUser(async ({ args: { member } }: Context & Pick<DuelCommandContext, 'args'>) => ({
      user: member.user,
    })),
    injectOpponent(),
    injectUser(),
    validateUsers(),
    withInMemoryCooldown(async (context: DuelCommandContext) => ({
      userId: context.user.id,
      max: 1,
      window: 10,
    })),
  ],
};

export default DuelCommand;
