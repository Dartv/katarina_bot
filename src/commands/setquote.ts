import { ICommand } from 'ghastly';

import { COMMAND_TRIGGERS, PriceTable } from '../util';
import { injectUser, withPrice } from './middleware';
import { ErrorResponse } from './responses';

const middleware = [injectUser(), withPrice(PriceTable.SETQUOTE)];

const handler = async (context): Promise<any> => {
  const { message, user, args } = context;
  const quote = args.quote.join(' ').trim();
  try {
    user.quote = quote;

    await user.save();

    await message.reply(`Set "${quote}" as your profile quote`);

    return null;
  } catch (err) {
    console.error(err);
    return ErrorResponse(`Couldn't set "${quote}" as your profile quote`, context);
  }
};

export default (): ICommand => ({
  middleware,
  handler,
  triggers: COMMAND_TRIGGERS.SET_QUOTE,
  description: 'Sets your profile quote',
  parameters: [
    {
      name: 'quote',
      description: 'Quote',
      repeatable: true,
    },
  ],
});
