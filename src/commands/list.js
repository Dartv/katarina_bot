import R from 'ramda';
import { injectUser } from './middleware';
import { TextResponse } from './responses';

export const middleware = [injectUser()];

export const listRefs = R.ifElse(
  R.length,
  R.compose(
    R.join(', '),
    R.pluck('ref')
  ),
  R.always('nothing!'),
);

export const handler = async ({ user: { images } }) =>
  new TextResponse('Your images:', listRefs(images));

export default () => ({
  middleware,
  handler,
  triggers: ['list'],
  description: 'Lists user\'s images',
});
