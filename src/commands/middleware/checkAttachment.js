export default () => async (next, context) => {
  if (context.message.attachments.size > 0) {
    const url = context.message.attachments.first().url;
    Object.assign(context, { args: Object.assign(context.args, { url }) });
  }

  return next(context);
};
