import { UserCharacterDocument } from '../../types';
import { createCharacterEmbed } from '../../utils/character';
import { isDocument } from '../../utils/mongo-common';

export const createEmbed: UserCharacterDocument['createEmbed'] = function (options) {
  if (!isDocument(this.character)) {
    throw new Error('Cannot create character embed with a non-populated character');
  }

  return createCharacterEmbed({
    ...this.character.toObject(),
    stars: this.stars,
    additionalStars: this.additionalStars,
    ...options,
  });
};
