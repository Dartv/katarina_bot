import { Command } from 'diskat';
import { formatDistanceStrict } from 'date-fns';

import { Context, GuildDocument, UserDocument } from '../../types';
import {
  Trigger,
  CommandGroupName,
  BattleType,
  BattleStatus,
  BATTLE_ROYALE_QUEUE_TIME_IN_MINUTES,
  MissionCode,
  ActionThreshold,
} from '../../utils/constants';
import { isTextChannel } from '../../utils/discord-common';
import { Battle, BattleParticipant } from '../../models';
import { ErrorResponse, SuccessResponse } from '../responses';
import { injectUser, withInMemoryCooldown } from '../middleware';

interface EnterCommandContext extends Context {
  guild: GuildDocument;
  user: UserDocument;
}

const EnterCommand: Command<EnterCommandContext> = async (context): Promise<any> => {
  const {
    user,
    guild,
    dispatch,
    formatter,
    client,
  } = context;
  const userCharactersCount = await user.characters.count();

  if (userCharactersCount < ActionThreshold.PARTICIPATE_IN_ROYALE) {
    return new ErrorResponse(context, `You should have at least ${ActionThreshold.PARTICIPATE_IN_ROYALE} characters`);
  }

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

EnterCommand.config = {
  triggers: Trigger.ENTER,
  group: CommandGroupName.GAMES,
  description: 'Enter Waifu Royale (Waifu Royale channel only)',
  middleware: [
    withInMemoryCooldown<EnterCommandContext>(async ({ message }) => ({
      userId: message.author.id,
      max: 1,
      window: 5,
    })),
    async (next, context: Context & { guild: GuildDocument }) => {
      const { message: { channel }, guild } = context;

      if (!guild.settings.royaleChannel) {
        return new ErrorResponse(context, 'Waifu Royale is not configured. Ask instance admin to configure it');
      }

      if (isTextChannel(channel) && guild.settings.royaleChannel === channel.id) {
        return next(context);
      }

      return new ErrorResponse(context, 'Not a Waifu Royale channel');
    },
    injectUser(),
    async (next, context: EnterCommandContext) => {
      const result = await next(context);

      context.client.emitter.emit('mission', MissionCode.BATTLE_ROYALE_DAILY, result, context);

      return result;
    },
  ],
};

export default EnterCommand;
