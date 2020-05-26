import { ICommandContext } from 'ghastly';

import { Character, Banner } from '../../models';
import { CharacterStar, ROLLS_TO_PITY } from '../../util';
import { rollNormalBanner } from './rollNormalBanner';
import { ICharacter } from '../../models/character/types';

export const rollCurrentBanner = async (context: ICommandContext): Promise<ICharacter> => {
  const { user } = context;
  let character = await rollNormalBanner(context);

  if (character.stars === CharacterStar.FIVE_STAR || user.rolls >= ROLLS_TO_PITY - 1) {
    const banner = await Banner
      .findOne({ endedAt: { $exists: false } })
      .sort({ createdAt: -1 })
      .populate({
        path: 'character',
        populate: {
          path: 'series',
        },
      });

    if (banner && banner.character instanceof Character) {
      ({ character } = banner);
      user.rolls = 0;
    }
  } else {
    user.rolls += 1;
  }

  return character;
};
