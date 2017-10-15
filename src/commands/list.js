import R from 'ramda';

import { injectUser } from './middleware';
import { TextResponse } from './responses';
import { COMMAND_TRIGGERS } from '../util/constants';

export const middleware = [injectUser()];

export const listRefs = R.ifElse(
  R.length,
  R.compose(
    R.join(', '),
    R.pluck('ref')
  ),
  R.always('nothing!'),
);

export const handler = async context =>
  TextResponse('Your images:', listRefs(context.user.images), context);

export default () => ({
  middleware,
  handler,
  triggers: COMMAND_TRIGGERS.LIST,
  description: 'Lists user\'s images',
});
