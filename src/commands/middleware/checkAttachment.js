import R from 'ramda';

import lenses from '../../util/lenses';

export default () => async (next, context) => R.ifElse(
  R.view(lenses.message.attachments.size),
  R.converge(R.set(lenses.args.url), [
    R.view(lenses.message.attachments.first.url),
    R.identity,
  ]),
  next,
)(context);
