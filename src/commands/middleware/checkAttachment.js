import R from 'ramda';

import lenses from '../../util/lenses';

const assignFirstAttachmentUrl = R.converge(lenses.args.url.set, [
  lenses.message.attachments.first.url.view,
  R.identity,
]);

export default () => async (next, context) => R.compose(
  next,
  R.when(
    lenses.message.attachments.size.view,
    assignFirstAttachmentUrl,
  ),
)(context);
