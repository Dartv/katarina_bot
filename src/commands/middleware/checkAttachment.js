import R from 'ramda';

import lenses from '../../util/lenses';

const assignFirstAttachmentUrl = R.converge(R.set(lenses.args.url), [
  R.view(lenses.message.attachments.first.url),
  R.identity,
]);

export default () => async (next, context) => R.compose(
  next,
  R.when(
    R.view(lenses.message.attachments.size),
    assignFirstAttachmentUrl,
  ),
)(context);
