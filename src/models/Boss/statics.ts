import { BossModel } from '../../types';
import { Character } from '../Character';

export const spawn: BossModel['spawn'] = async function (guild) {
  const previous = await this
    .findOne({ guild })
    .sort({ createdAt: -1 });

  if (previous) {
    previous.endedAt = new Date();
    await previous.save();
  }

  const [character] = await Character.random(1);
  const boss = new this({
    guild,
    character: character._id,
  });
  await boss.populate({
    path: 'character',
    populate: {
      path: 'series',
    },
  }).execPopulate();
  return boss;
};

export const reward: BossModel['reward'] = function (place) {
  switch (place) {
    case 0: return 300;
    case 1: return 150;
    case 2: return 100;
    default: return 50;
  }
};
