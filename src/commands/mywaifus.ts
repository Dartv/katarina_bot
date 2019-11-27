import { Command } from '../types';
import { COMMAND_TRIGGERS } from '../util';
import { injectUser } from './middleware';
import { User } from '../models';
import { ErrorResponse } from './responses';

const handler = async (context) => {
  try {
    const { user, args: { stars = 5 }, message } = context;
    const data = await user.getCharactersByStars({ stars: Number(stars) });

    if (!data.length) {
      await message.reply(`No ${stars} star waifus 😢`);
      return null;
    }

    const msg = data.map(({ name, count }) => `${name} x${count}`).join(', ');
    await message.reply(msg);
    return null;
  } catch (err) {
    console.error(err);
    return ErrorResponse('Couldn\'t fetch waifus...', context);
  }
};

export default (): Command => ({
  middleware: [injectUser()],
  handler,
  triggers: COMMAND_TRIGGERS.MYWAIFUS,
  description: 'Displays a list of your collected waifus',
  parameters: [
    {
      name: 'stars',
      description: 'stars',
      defaultValue: 5,
      optional: true,
    },
  ],
});
