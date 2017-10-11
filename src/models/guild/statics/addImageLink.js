import R from 'ramda';

import { SuccessResponse } from '../../../commands/responses';
import { concurrentlyD } from '../../../util/handlers';

export const addImageLink = async ({ args: { ref, url }, user, guild }) =>
  guild.addImageLink({ ref, url, user: user.id });

export default async context => R.compose(
  p => p.then(() => SuccessResponse(
    'Successfully added an image link',
    `post it with \`${process.env.BOT_PREFIX}gpost ${context.args.ref}\`.`,
    context
  )),
  concurrentlyD([addImageLink]),
)(context);
