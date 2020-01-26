import { Middleware, ICommandHandler, ICommand } from 'ghastly';
import {
  isSameHour, formatDistance, addHours, startOfHour,
} from 'date-fns';

import { COMMAND_TRIGGERS } from '../util';
import { injectUser } from './middleware';
import { ErrorResponse, SuccessResponse } from './responses';
import { IUser } from '../models/user/types';

export const exp = 100;

const checkCooldown: Middleware = async (next, context) => {
  const { user } = context;

  if (isSameHour((user as IUser).visitedAt, new Date())) {
    const distance = formatDistance(startOfHour(addHours(user.visitedAt, 1)), user.visitedAt);
    return ErrorResponse(`Command available in ${distance}`, context);
  }

  return next(context);
};

const middleware = [injectUser(), checkCooldown];

const handler: ICommandHandler = async (context): Promise<any> => {
  const { args: { slug } } = context;
  const { user }: { user?: IUser } = context;

  const character = await user.visit({ slug, exp }, context);

  return SuccessResponse(`${exp} exp received`, `You visited ${character.name}`, context);
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
