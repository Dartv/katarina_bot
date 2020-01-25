import { Middleware } from 'ghastly';
import { isSameHour, formatDistance, addHours } from 'date-fns';

import { ICommand, ICommandHandler } from '../types';
import { COMMAND_TRIGGERS } from '../util';
import { injectUser } from './middleware';
import { CharacterInfo, Character } from '../models';
import { ErrorResponse, SuccessResponse } from './responses';
import { IUser } from '../models/user/types';

export const EXP = 100;

const checkCooldown: Middleware = async (next, context) => {
  const { user } = context;

  if (isSameHour((user as IUser).visitedAt, new Date())) {
    const distance = formatDistance(addHours(new Date(), 1), user.visitedAt);
    return ErrorResponse(`Command available in ${distance}`, context);
  }

  return next(context);
};

const middleware = [injectUser(), checkCooldown];

const handler: ICommandHandler = async (context): Promise<any> => {
  const { user, args: { slug } } = context;
  const character = await Character.findOne({
    slug,
    _id: { $in: user.characters },
  });

  if (!character) {
    return ErrorResponse('Character not found', context);
  }

  let info = await CharacterInfo.findOne({
    user: user._id,
    character: character._id,
  });

  if (!info) {
    info = new CharacterInfo({
      user: user._id,
      character: character._id,
      exp: EXP,
    });
    info.$locals.context = context;
    await info.save();
  } else {
    info.exp += EXP;
    info.$locals.context = context;
    await info.save();
  }

  user.visitedAt = new Date();
  await user.save();

  return SuccessResponse(`${EXP} exp received`, `You visited ${character.name}`, context);
};

export default (): ICommand => ({
  handler,
  middleware,
  parameters: [
    {
      name: 'slug',
      description: 'slug',
    },
  ],
  triggers: COMMAND_TRIGGERS.VISIT,
  description: 'Visit a character and start a relationship',
});
