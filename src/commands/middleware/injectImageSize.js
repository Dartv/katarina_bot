import request from 'request';
import R from 'ramda';

import { gm } from '../../util';

export default () => async (next, context) => {
  const size = await gm(request(context.image.url)).size();
  return next(R.mergeDeepRight(context, { image: { size } }));
};
