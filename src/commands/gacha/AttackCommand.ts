import { Command } from 'diskat';

import {
  Context,
  UserDocument,
  GuildDocument,
  CharacterDocument,
} from '../../types';
import {
  Trigger,
  CommandGroupName,
  ChannelName,
  DamageByStar,
} from '../../utils/constants';
import { injectUser } from '../middleware';
import { isTextChannel } from '../../utils/discord-common';
import { Boss } from '../../models';
import { ErrorResponse } from '../responses';
import { createCharacterEmbed } from '../../utils/character';
import { rewardUser } from '../../utils/user';

export interface AttackCommandContext extends Context {
  user: UserDocument;
  guild: GuildDocument;
}

const attackWorldBoss = async (context: AttackCommandContext): Promise<any> => {
  const {
    user,
    guild,
    message,
    dispatch,
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

  const [userCharacter] = await user.characters.fetchRandom(1);
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

const AttackCommand: Command<AttackCommandContext> = async (context) => {
  const { message } = context;
  const { channel } = message;

  if (isTextChannel(channel)) {
    switch (channel.name) {
      case ChannelName.WORLD_BOSS_ARENA:
        return attackWorldBoss(context);
      default: return null;
    }
  }

  return null;
};

AttackCommand.config = {
  triggers: Trigger.ATTACK,
  description: 'Attack current enemy',
  middleware: [
    injectUser(),
  ],
  group: CommandGroupName.GACHA,
};

export default AttackCommand;
