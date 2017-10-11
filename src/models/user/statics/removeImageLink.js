import R from 'ramda';

import { SuccessResponse } from '../../../commands/responses';
import { concurrentlyD } from '../../../util/handlers';

export const removeImageLink = async ({ user, image }) => user.removeImageLink(image);

export default async context => R.compose(
  p => p.then(() =>
    SuccessResponse(`successfully removed "${context.image.ref}"`, '', context)),
  concurrentlyD([removeImageLink]),
)(context);
