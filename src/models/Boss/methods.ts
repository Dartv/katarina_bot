import { differenceInHours } from 'date-fns';

import { BossDocument, BossParticipantDocument } from '../../types';
import { getDocumentId } from '../../utils/mongo-common';
import { WORLD_BOSS_SCALE_FACTOR } from '../../utils/constants';
import { getDailyResetDate } from '../../utils/daily';

const calculateHpScale = (): number => {
  const hoursLeft = differenceInHours(getDailyResetDate(), new Date());
  return Math.round((hoursLeft / 24) * WORLD_BOSS_SCALE_FACTOR);
};

export const injure: BossDocument['injure'] = async function (damage, user) {
  let participant = this.participants.find(p => getDocumentId(p.user).equals(user._id));
  if (participant) {
    participant.damage += damage;
  } else {
    participant = {
      damage,
      user: user._id,
      joinedAt: new Date(),
    } as BossParticipantDocument;
    const hpScale = Math.max(calculateHpScale(), this.stats.maxHp ? 0 : 150);

    if (!this.stats.maxHp) {
      this.stats.hp = hpScale;
      this.stats.maxHp = hpScale;
    } else if (this.participants.length > 3) {
      this.stats.hp += hpScale;
      this.stats.maxHp += hpScale;
    }

    this.participants.push(participant);
  }

  this.stats.hp -= damage;

  if (this.stats.hp <= 0) {
    this.isDefeated = true;
  }

  return this;
};
