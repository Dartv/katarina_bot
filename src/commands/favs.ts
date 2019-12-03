import { ICommand } from '../types';
import { COMMAND_TRIGGERS } from '../util';
import { injectUser } from './middleware';
import { ErrorResponse } from './responses';

const handler = async (context) => {
  const { user, args: { stars }, message } = context;
  try {
    const data = await user.getCharactersByStars({ stars, field: 'favorites' });

    if (!data.length) {
      await message.reply('No favorite waifus 😢');
      return null;
    }

    const msg = data.map(({ name, count }) => `${name} x${count}`).join(', ');
    await message.reply(msg);
    return null;
  } catch (err) {
    console.error(err);
    return ErrorResponse('Couldn\'t list your favorites', context);
  }
};

export default (): ICommand => ({
  middleware: [injectUser()],
  handler,
  triggers: COMMAND_TRIGGERS.FAVS,
  description: 'Lists your favorite waifus',
  parameters: [
    {
      name: 'stars',
      description: 'stars',
      optional: true,
      defaultValue: null,
    },
  ],
});
