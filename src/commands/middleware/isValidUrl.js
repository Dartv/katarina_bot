import { isUri } from 'valid-url';

export default arg => async (next, context) => {
  if (isUri(context.args[arg])) return next(context);

  return context.message.reply('invalid url provided');
};
