const { isUri } = require('valid-url');

module.exports = arg => async (next, context) => {
  if (isUri(context.args[arg])) return next(context);

  return context.message.reply('invalid url provided');
};
