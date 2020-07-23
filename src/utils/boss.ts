import { MessageEmbed, Constants } from 'discord.js';

import { BossDocument, BossWinner, CharacterDocument } from '../types';

export const createBossStatisticsEmbed = (boss: BossDocument, winners: BossWinner[]): MessageEmbed => {
  const [mvp] = winners;
  return new MessageEmbed()
    .setTitle(`Statistics for "${(boss.character as CharacterDocument).name}"`)
    .setColor(Constants.Colors.BLUE)
    .setAuthor(`MVP: ${mvp.member.displayName}`, mvp.member.user.avatarURL())
    .addField(
      'User',
      winners.map((winner) => winner.member.displayName).join('\n'),
      true,
    )
    .addField(
      'Damage',
      winners.map((winner) => winner.damage).join('\n'),
      true,
    )
    .addField(
      'Reward',
      winners.map((winner) => `${winner.reward} 💎`).join('\n'),
      true,
    );
};

export const getBossReward = (place: number): number => {
  switch (place) {
    case 0: return 300;
    case 1: return 150;
    case 2: return 100;
    default: return 50;
  }
};
