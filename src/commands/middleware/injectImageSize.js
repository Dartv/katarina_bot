import request from 'request';

import { gm } from '../../util';

export default () => async (next, context) => {
  // merging context.image with new parameter returns the whole mongoose document.
  // eslint-disable-next-line no-param-reassign
  context.image.size = await gm(request(context.image.url)).size();
  return next(context);
};
