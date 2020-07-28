import { Command } from 'diskat';
import { formatDistanceStrict } from 'date-fns';

import { Context, GuildDocument, UserDocument } from '../../types';
import {
  Trigger,
  CommandGroupName,
  ChannelName,
  BattleType,
  BattleStatus,
  BATTLE_ROYALE_QUEUE_TIME_IN_MINUTES,
  MissionCode,
} from '../../utils/constants';
import { isTextChannel } from '../../utils/discord-common';
import { Battle, BattleParticipant } from '../../models';
import { ErrorResponse, SuccessResponse } from '../responses';
import { injectUser, withInMemoryCooldown } from '../middleware';

interface EnterCommandContext extends Context {
  guild: GuildDocument;
  user: UserDocument;
}

const enterBattleRoyale = async (context: EnterCommandContext): Promise<any> => {
  const {
    user,
    guild,
    dispatch,
    formatter,
    client,
  } = context;
  let battle = await Battle.findOne({
    guild: guild._id,
    type: BattleType.ROYALE,
  }).sort({ createdAt: -1 });

  if (!battle || [BattleStatus.COMPLETED, BattleStatus.FAILED].includes(battle.status)) {
    battle = await new Battle({
      guild: guild._id,
      type: BattleType.ROYALE,
      status: BattleStatus.WAITING,
    }).save();

    const command = formatter.code(`${client.dispatcher.prefix}${Trigger.ENTER[0]}`);
    await dispatch(
      `Waifu Royale round is starting. Type ${command} to participate!\n`
      + `Round will start after ${BATTLE_ROYALE_QUEUE_TIME_IN_MINUTES} minutes.`
    );
  } else {
    const participant = await BattleParticipant.findOne({
      battle: battle._id,
      user: user._id,
    });

    if (participant) {
      return new ErrorResponse(context, 'You are already participating');
    }
  }

  const [[userCharacter], count] = await Promise.all([
    user.characters.fetchRandom(1),
    BattleParticipant.countDocuments({ battle: battle._id }),
  ]);

  if (!userCharacter) {
    return new ErrorResponse(context, 'You have no characters');
  }

  await new BattleParticipant({
    battle: battle._id,
    user: user._id,
    characters: [userCharacter._id],
  }).save();

  const queueTime = formatDistanceStrict(new Date(battle.createdAt), new Date());
  return new SuccessResponse({
    title: 'Registered',
    description: `${formatter.bold('Participants')}: ${count + 1}\n${formatter.bold('Queue time')}: ${queueTime}`,
  }, context);
};

const EnterCommand: Command<EnterCommandContext> = async (context) => {
  const { message } = context;

  if (isTextChannel(message.channel)) {
    switch (message.channel.name) {
      case ChannelName.BATTLE_ROYALE:
        return enterBattleRoyale(context);
      default:
    }
  }

  return null;
};

EnterCommand.config = {
  triggers: Trigger.ENTER,
  group: CommandGroupName.GACHA,
  description: 'Enter Waifu Royale (Waifu Royale channel only)',
  middleware: [
    injectUser(),
    withInMemoryCooldown<EnterCommandContext>(async ({ user }) => ({
      userId: user.id,
      max: 1,
      window: 5,
    })),
    async (next, context: EnterCommandContext) => {
      const result = await next(context);

      context.client.emitter.emit('mission', MissionCode.BATTLE_ROYALE_DAILY, result, context);

      return result;
    },
  ],
};

export default EnterCommand;
