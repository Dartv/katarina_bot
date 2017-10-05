import R from 'ramda';

import { SuccessResponse } from '../../../commands/responses';
import { concurrentlyD } from '../../../util/handlers';

export const addImageLink = async ({ args: { ref, url }, user }) => {
  return user.addImageLink({ ref, url });
};

export default async context => R.compose(
  p => p.then(() => new SuccessResponse(
    'Successfully added an image link',
    `post it with \`${process.env.BOT_PREFIX}post ${context.args.ref}\`.`
  )),
  concurrentlyD([addImageLink]),
)(context);
