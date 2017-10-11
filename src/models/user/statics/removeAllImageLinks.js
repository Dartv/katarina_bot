import R from 'ramda';

import { SuccessResponse } from '../../../commands/responses';
import { concurrentlyD } from '../../../util/handlers';

const removeAllImageLinks = async ({ user }) => user.removeAllImageLinks();

export default async context => R.compose(
  p => p.then(() => SuccessResponse('Successfully removed all image links', '', context)),
  concurrentlyD([removeAllImageLinks]),
)(context);
