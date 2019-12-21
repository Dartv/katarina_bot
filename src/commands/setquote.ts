import { ICommand } from '../types';
import { COMMAND_TRIGGERS } from '../util';
import { injectUser } from './middleware';
import { ErrorResponse } from './responses';

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
  middleware: [injectUser()],
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
