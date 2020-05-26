import { ICommandHandler } from 'ghastly';

import { Character } from '../../models';
import { ICharacter } from '../../models/character/types';

export const rollLocalBanner: ICommandHandler = async (): Promise<ICharacter> => {
  const [character] = await Character.random(1);
  return character;
};
