import R from 'ramda';

import lenses from '../../util/lenses';

const assignFirstAttachmentUrlToArgs = R.converge(R.set(lenses.args.url as any), [
  R.view(lenses.message.attachments.first.url as any),
  R.identity,
]);

export default () => async (next, context) => R.compose(
  next,
  R.when(
    R.view(lenses.message.attachments.size as any),
    assignFirstAttachmentUrlToArgs,
  ),
)(context);
