import { ICommandHandler } from 'ghastly';

import { Character, Banner } from '../../models';
import { createCharacterEmbed } from '../../models/character/util';
import { CharacterStar, ROLLS_TO_PITY } from '../../util';

export const rollCurrentBanner: ICommandHandler = async (context) => {
  const { dispatch, user } = context;
  let [character] = await Character.random(1);

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

  const embed = createCharacterEmbed(character);
  await dispatch(embed);
  return character;
};
