import { differenceInHours } from 'date-fns';
import { Constants, MessageEmbed } from 'discord.js';

import {
  BossDocument,
  CharacterDocument,
  BossWinner,
  UserDocument,
  BossModel,
} from '../../types';
import { getDocumentId } from '../../utils/mongo-common';
import { WORLD_BOSS_SCALE_FACTOR, ModelName } from '../../utils/constants';
import { getDailyResetDate } from '../../utils/daily';
import { createCharacterEmbed } from '../../utils/character';
import { BossParticipant } from '../BossParticipant';

const calculateHpScale = (): number => {
  const hoursLeft = differenceInHours(getDailyResetDate(), new Date());
  return Math.round((hoursLeft / 24) * WORLD_BOSS_SCALE_FACTOR);
};

export const injure: BossDocument['injure'] = async function (damage, user) {
  let participant = await BossParticipant.findOne({ boss: this._id, user: user._id });
  if (participant) {
    participant.damage += damage;
    participant.lastAttackedAt = new Date();
    await participant.save();
  } else {
    const result = await Promise.all([
      new BossParticipant({
        damage,
        boss: this._id,
        user: user._id,
        lastAttackedAt: new Date(),
      }).save(),
      BossParticipant.countDocuments({ boss: this._id }),
    ]);
    [participant] = result;
    const [, participantsCount] = result;
    const hpScale = Math.max(calculateHpScale(), this.stats.maxHp ? 0 : 150);

    if (!this.stats.maxHp) {
      this.stats.hp = hpScale;
      this.stats.maxHp = hpScale;
    } else if (participantsCount > 3) {
      this.stats.hp += hpScale;
      this.stats.maxHp += hpScale;
    }
  }

  this.stats.hp -= damage;

  if (this.stats.hp <= 0) {
    this.isDefeated = true;
  }

  return this;
};

export const getEmbed: BossDocument['getEmbed'] = function () {
  return createCharacterEmbed({
    ...(this.character as CharacterDocument).toObject(),
    stars: null,
  })
    .setColor(Constants.Colors.DARK_RED)
    .addField('❤️ HP', `${this.stats.hp ?? '?'}/${this.stats.maxHp ?? '?'}`);
};

export const getWinners: BossDocument['getWinners'] = async function (guild) {
  const model = this.constructor as BossModel;
  const participants = await BossParticipant.find({ boss: this._id }).sort({ damage: -1 }).limit(12);
  const promises: Promise<BossWinner>[] = participants.map(async (participant, i) => {
    const user = await this.model(ModelName.USER).findOne({
      _id: getDocumentId(participant.user),
    }) as UserDocument;
    if (user) {
      const member = await guild.members.fetch(user.discordId);
      if (member) {
        const reward = model.reward(i);
        user.currency += reward;
        await user.save();
        return {
          participant,
          user,
          member,
          reward,
        };
      }
    }

    return null;
  });
  return Promise.all(promises).then(res => res.filter(Boolean));
};

export const getStatisticsEmbed: BossDocument['getStatisticsEmbed'] = async function (guild) {
  const winners = await this.getWinners(guild);
  const [mvp] = winners;
  return new MessageEmbed()
    .setTitle(`Statistics for "${(this.character as CharacterDocument).name}"`)
    .setColor(Constants.Colors.BLUE)
    .setAuthor(`MVP: ${mvp.member.displayName}`, mvp.member.user.avatarURL())
    .addField(
      'User',
      winners.map((winner) => winner.member.displayName).join('\n'),
      true,
    )
    .addField(
      'Damage',
      winners.map((winner) => winner.participant.damage).join('\n'),
      true,
    )
    .addField(
      'Reward',
      winners.map((winner) => `${winner.reward} 💎`).join('\n'),
      true,
    );
};
