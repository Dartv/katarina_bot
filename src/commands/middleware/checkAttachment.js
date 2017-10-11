import R from 'ramda';

export default () => async (next, context) => {
  if (context.message.attachments.size) {
    const url = context.message.attachments.first().url;
    // TODO: refactor
    const newContext = R.set(R.lensPath(['args', 'url']), url, context);
    return next(newContext);
  }

  return next(context);
};
