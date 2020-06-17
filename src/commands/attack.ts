import {
  ICommand, ICommandHandler, ICommandContext, Middleware,
} from 'ghastly';
import { TextChannel, RichEmbed } from 'discord.js';
import R from 'ramda';

import {
  COMMAND_TRIGGERS, ChannelName, DamageByStar, Color,
} from '../util';
import { injectUser, injectGuild, withPersonalCooldown } from './middleware';
import { WorldBoss, Character, User } from '../models';
import { ErrorResponse } from './responses/ErrorResponse';
import { createCharacterEmbed } from '../models/character/util';
import { IWorldBossParticipant } from '../models/world-boss/types';
import { ICharacter } from '../models/character/types';

const getReward = (i: number): number => {
  switch (i) {
    case 0: return 300;
    case 1: return 150;
    case 2: return 100;
    default: return 50;
  }
};

const middleware: Middleware[] = [
  injectUser(),
  injectGuild(),
  withPersonalCooldown({
    maxAge: 60 * 60,
  }),
];

const attackWorldBoss = async (context: ICommandContext): Promise<void> => {
  const {
    user,
    guild,
    dispatch,
    message,
    formatter,
  } = context;

  if (user.characters.length < 10) {
    return new ErrorResponse('You should have at least 10 characters', context);
  }

  const boss = await WorldBoss.findOne({ guild: guild._id }).sort({ createdAt: -1 });

  if (!boss || boss.defeated) {
    return new ErrorResponse('There is no boss to fight', context);
  }

  if (boss) {
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
    const damage = DamageByStar[character.stars];
    const embed = createCharacterEmbed(character.toObject())
      .setImage(null)
      .setThumbnail(character.imageUrl)
      .setDescription('');
    boss.injure(damage, user);

    await boss.save();

    await message.channel.send(`${message.member.displayName} deals ${damage} to the boss`, {
      embed,
    });
    await dispatch(await boss.embed());

    if (boss.defeated) {
      await user.reward(50, 'Boss defeated', context);

      const { members } = await message.guild.fetchMembers();
      const participants: IWorldBossParticipant[] = Array.from(boss.participants.values())
        .sort(R.descend(R.prop('damage')));
      const promises = participants.map(async (participant, i) => {
        const participantUser = await User.findOne({ _id: participant.user });
        if (participantUser) {
          participantUser.currency += getReward(i);
          await participantUser.save();
          const member = members.get(participantUser.discordId);
          if (member) {
            return {
              ...(participant as any).toObject(),
              user: participantUser,
              member,
            };
          }
        }
        return undefined;
      });
      const winners = await Promise.all(promises).then((res) => res.filter(Boolean));
      const [mvp] = winners;
      const statisticsEmbed = new RichEmbed()
        .setTitle(`Statistics for ${(boss.character as ICharacter).name}`)
        .setColor(Color.BLUE)
        .setAuthor(`MVP: ${mvp.member.displayName}`, mvp.member.user.avatarURL);

      winners.slice(0, 10).forEach((winner, i) => {
        statisticsEmbed.addField(
          formatter.bold(winner.member.displayName),
          `
          ${formatter.bold('Damage')}: ${winner.damage}⚔️
          ${formatter.bold('Reward')}: ${getReward(i)}💎
          `.trim(),
          true,
        );
      });

      await dispatch(statisticsEmbed);
    }
  }

  return undefined;
};

const handler: ICommandHandler = async (context): Promise<any> => {
  const { message } = context;
  const { channel } = message;

  if (channel instanceof TextChannel) {
    switch (channel.name) {
      case ChannelName.WORLD_BOSS_ARENA:
        return attackWorldBoss(context);
      default:
    }
  }

  return null;
};

export default (): ICommand => ({
  handler,
  middleware,
  triggers: COMMAND_TRIGGERS.ATTACK,
  description: 'Attacks current enemy',
});
