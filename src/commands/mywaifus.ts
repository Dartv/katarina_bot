import { pluck } from 'ramda';
import { ICommand, ICommandHandler } from 'ghastly';

import { COMMAND_TRIGGERS } from '../util';
import { injectUser } from './middleware';
import { ErrorResponse } from './responses';

const getCharacters = async (context) => {
  const { user, args: { input, page } } = context;

  const limit = 10;
  const skip = page > 0 ? limit * (page - 1) : 0;

  if (Number.isInteger(Number(input))) {
    return user.getCharactersByStars({ stars: Number(input), limit, skip });
  }

  return user.getCharactersBySeries(input, { limit, skip });
};

const handler: ICommandHandler = async (context) => {
  try {
    const { message } = context;
    const data = await getCharacters(context);

    if (!data.length) {
      await message.reply('No waifus 😢');
      return null;
    }

    const msg = pluck('name', data as any[]).join(', ');
    await message.reply(msg);
    return null;
  } catch (err) {
    console.error(err);
    return ErrorResponse('Couldn\'t fetch waifus...', context);
  }
};

export default (): ICommand => ({
  middleware: [injectUser()],
  handler,
  triggers: COMMAND_TRIGGERS.MYWAIFUS,
  description: 'Displays a list of your collected waifus',
  parameters: [
    {
      name: 'input',
      description: 'stars or series title',
      defaultValue: 5,
      optional: true,
    },
    {
      name: 'page',
      description: 'page',
      defaultValue: 1,
      optional: true,
    },
  ],
});
