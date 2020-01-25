import { ICommandHandler } from 'ghastly';

import { Character } from '../../models';
import { createCharacterEmbed } from '../../models/character/util';

export const rollLocalBanner: ICommandHandler = async (context) => {
  const { dispatch } = context;
  const [character] = await Character.random(1);
  const embed = createCharacterEmbed(character);
  await dispatch(embed);
  return character;
};
