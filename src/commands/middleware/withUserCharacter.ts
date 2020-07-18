import { WithUserCharacterMiddleware, UserCharacterPopulated } from '../../types';
import { Character, UserCharacter } from '../../models';
import { ErrorResponse } from '../responses';

export const withUserCharacter: WithUserCharacterMiddleware = (config) => async (next, context) => {
  const { user, slug } = await config(context);

  const character = await Character.findOne({ slug });

  if (!character) {
    return new ErrorResponse(context, `Character "${slug}" does not exist`);
  }

  const userCharacter = await UserCharacter.findOne({
    character: character._id,
    user: user._id,
  }).populate({
    path: 'character',
    populate: {
      path: 'series',
    },
  }) as UserCharacterPopulated;

  if (!userCharacter) {
    return new ErrorResponse(context, `Could not find "${slug}" among your characters`);
  }

  return next({ ...context, userCharacter });
};
