import { Command } from 'diskat';

import {
  Context,
  UserDocument,
  GuildDocument,
  CharacterDocument,
  BossParticipantDocument,
  BossWinner,
} from '../../types';
import {
  Trigger,
  CommandGroupName,
  ChannelName,
  DamageByStar,
} from '../../utils/constants';
import { injectUser } from '../middleware';
import { isTextChannel } from '../../utils/discord-common';
import { Boss, User } from '../../models';
import { ErrorResponse } from '../responses';
import { createCharacterEmbed, createBossEmbed } from '../../utils/character';
import { descend } from '../../utils/common';
import { getDocumentId } from '../../utils/mongo-common';
import { rewardUser } from '../../utils/user';
import { getBossReward, createBossStatisticsEmbed } from '../../utils/boss';

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
  const embed = createCharacterEmbed({
    ...userCharacter.toObject(),
    ...(userCharacter.character as CharacterDocument).toObject(),
  });

  embed.setDescription('').setThumbnail(embed.image.url).setImage(null);

  await boss.injure(damage, user);
  await boss.save();

  await message.channel.send(
    `${message.member.displayName} deals ${damage} damage to ${(boss.character as CharacterDocument).name}`,
    { embed },
  );
  await dispatch(createBossEmbed(boss));

  if (boss.isDefeated) {
    await rewardUser({
      user,
      reward: 50,
      title: 'Boss defeated',
      context,
    });
    const participants: BossParticipantDocument[] = boss.participants.sort(
      (p1, p2) => descend((p) => p.damage, p1, p2)
    ).slice(0, 12);
    const promises: Promise<BossWinner>[] = participants.map(async (participant, i) => {
      const participantUser = await User.findOne({ _id: getDocumentId(participant.user) });
      if (participantUser) {
        const member = await message.guild.members.fetch(participantUser.discordId);
        if (member) {
          const reward = getBossReward(i);
          participantUser.currency += reward;
          await participantUser.save();
          return {
            ...participant.toObject(),
            user: participantUser,
            member,
            reward,
          };
        }
      }

      return null;
    });
    const winners = await Promise.all(promises).then(res => res.filter(Boolean));
    return createBossStatisticsEmbed(boss, winners);
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
