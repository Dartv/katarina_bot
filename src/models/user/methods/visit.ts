import { ICommandContext } from 'ghastly';

import { ICharacter } from '../../character/types';
import Character from '../../character';
import CharacterInfo from '../../characterInfo';
import { IUser } from '../types';
import { ICharacterInfo } from '../../characterInfo/types';

export interface IVisitCharacterInput {
  slug: ICharacter['slug'];
  exp: ICharacterInfo['exp'];
}

export default async function visitCharacter(
  this: IUser,
  { slug, exp }: IVisitCharacterInput,
  context?: ICommandContext
): Promise<ICharacter> {
  const character = await Character.findOne({
    slug,
    _id: { $in: this.characters },
  });

  if (!character) {
    return null;
  }

  let { info } = await character.fetchInfo(this._id);

  if (info) {
    info.exp += exp;
  } else {
    info = new CharacterInfo({
      exp,
      user: this._id,
      character: character._id,
    });
  }

  info.$locals.context = context;
  this.visitedAt = new Date();

  await Promise.all([
    info.save(),
    this.save(),
  ]);

  return character;
}
