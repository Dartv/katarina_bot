import { differenceInHours } from 'date-fns';

import { IWorldBoss } from '../types';
import { IUser } from '../../user/types';
import { WORLD_BOSS_SCALE_FACTOR } from '../../../util';
import { getDailyResetDate } from '../../../util/daily';

const calculateHpScale = (): number => {
  const hoursLeft = differenceInHours(getDailyResetDate(), new Date());
  return Math.round((hoursLeft / 24) * WORLD_BOSS_SCALE_FACTOR);
};

export default async function injure(this: IWorldBoss, damage: number, user: IUser): Promise<IWorldBoss> {
  const userId = user._id.toString();

  if (this.participants.has(userId)) {
    this.participants.get(userId).damage += damage;
  } else {
    const participant = {
      damage,
      user: user._id,
      joinedAt: new Date(),
    };
    const hpScale = Math.max(calculateHpScale(), this.maxHp ? 0 : 150);

    if (this.participants.size > 3 || !this.maxHp) {
      this.hp += hpScale;
      this.maxHp += hpScale;
    }
    this.participants.set(userId, participant);
  }

  this.hp -= damage;

  if (this.hp <= 0) {
    this.defeated = true;
  }

  return this;
}
