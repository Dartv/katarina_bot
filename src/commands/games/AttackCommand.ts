import { Command, Middleware } from 'diskat';
import { addHours, isSameHour } from 'date-fns';

import {
  Context,
  UserDocument,
  GuildDocument,
  CharacterDocument,
  BossDocument,
} from '../../types';
import {
  Trigger,
  CommandGroupName,
  DamageByStar,
  MissionCode,
  ActionThreshold,
} from '../../utils/constants';
import { injectUser } from '../middleware';
import { isTextChannel } from '../../utils/discord-common';
import { Boss, BossParticipant, UserCharacter } from '../../models';
import { ErrorResponse, CooldownResponse } from '../responses';
import { createCharacterEmbed } from '../../utils/character';
import { rewardUser } from '../../utils/user';

export interface AttackCommandContext extends Context {
  user: UserDocument;
  guild: GuildDocument;
  boss: BossDocument;
}

const COOLDOWN_IN_HOURS = 1;

const injectBoss = (): Middleware<
  Omit<AttackCommandContext, 'boss'>,
  AttackCommandContext
> => async (next, context) => {
  const { guild } = context;
  const boss = await Boss
    .findOne({ guild: guild._id })
    .sort({ createdAt: -1 })
    .populate({
      path: 'character',
      populate: {
        path: 'series',
      },
    });

  if (!boss || boss.isDefeated) {
    return new ErrorResponse(context, 'There is no boss to fight');
  }

  return next({ ...context, boss });
};

const applyCooldown = (): Middleware<AttackCommandContext, AttackCommandContext> => async (next, context) => {
  const { boss, user } = context;
  const participant = await BossParticipant.findOne({ boss: boss._id, user: user._id });

  if (!participant) {
    return next(context);
  }

  if (isSameHour(new Date(), new Date(participant.lastAttackedAt))) {
    return new CooldownResponse(context, addHours(new Date(participant.lastAttackedAt), COOLDOWN_IN_HOURS));
  }

  return next(context);
};

const AttackCommand: Command<AttackCommandContext> = async (context): Promise<any> => {
  const {
    user,
    guild,
    message,
    dispatch,
    client,
  } = context;

  const boss = await Boss
    .findOne({ guild: guild.id })
    .sort({ createdAt: -1 })
    .populate({
      path: 'character',
      populate: {
        path: 'series',
      },
    });

  if (!boss || boss.isDefeated) {
    return new ErrorResponse(context, 'There is no boss to fight');
  }

  const ownedCharacters = await UserCharacter.find({ user: user._id }).count();

  if (ownedCharacters < ActionThreshold.ATTACK_WORLD_BOSS) {
    return new ErrorResponse(context, `You should have at least ${ActionThreshold.ATTACK_WORLD_BOSS} characters`);
  }

  const [userCharacter] = await user.characters.fetchRandom(1);

  if (!userCharacter) {
    return new ErrorResponse(context, 'You do not have any characters');
  }

  const damage = DamageByStar[userCharacter.stars];

  await boss.injure(damage, user);
  await boss.save();

  const embed = createCharacterEmbed({
    ...userCharacter.toObject(),
    ...(userCharacter.character as CharacterDocument).toObject(),
  });
  embed.setDescription('').setThumbnail(embed.image.url).setImage(null);
  await message.channel.send(
    `${message.member.displayName} deals ${damage} damage to ${(boss.character as CharacterDocument).name}`,
    { embed },
  );
  await dispatch(boss.getEmbed());

  if (boss.isDefeated) {
    client.emitter.emit('mission', MissionCode.DEFEAT_WORLD_BOSS_WEEKLY, boss, context);

    await rewardUser({
      user,
      reward: 50,
      title: 'Boss defeated',
      context,
    });
    return boss.getStatisticsEmbed(message.guild);
  }

  return null;
};

AttackCommand.config = {
  triggers: Trigger.ATTACK,
  description: 'Attack World Boss (World Boss channel only)',
  middleware: [
    async (next, context: Context & { guild: GuildDocument }) => {
      const { guild, message: { channel } } = context;

      if (!guild.settings.bossChannel) {
        return new ErrorResponse(context, 'World Boss is not configured. Ask your instance admin to configure it');
      }

      if (isTextChannel(channel) && guild.settings.bossChannel === channel.id) {
        return next(context);
      }

      return new ErrorResponse(context, 'Not a World Boss channel');
    },
    injectUser(),
    injectBoss(),
    applyCooldown(),
    async (next, context: AttackCommandContext) => {
      const result = await next(context);

      context.client.emitter.emit('mission', MissionCode.WORLD_BOSS_DAILY, result, context);

      return result;
    },
  ],
  group: CommandGroupName.GAMES,
};

export default AttackCommand;
