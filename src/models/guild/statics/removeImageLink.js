import R from 'ramda';

import { SuccessResponse } from '../../../commands/responses';
import { concurrentlyD } from '../../../util/handlers';

export const removeImageLink = async ({ guild, image }) => guild.removeImageLink(image);

export default async context => R.compose(
  p => p.then(() => SuccessResponse(`successfully removed "${context.image.ref}"
    from this guild's images`, '', context)),
  concurrentlyD([removeImageLink]),
)(context);
