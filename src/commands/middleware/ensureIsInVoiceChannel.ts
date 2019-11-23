import R from 'ramda';

import { ErrorResponse } from '../responses';
import { ERRORS } from '../../util/constants';
import { lenses } from '../../util';

export default () => async (next, context) => R.ifElse(
  R.view(lenses.message.guild.voiceConnection as any),
  next,
  ctx => ErrorResponse(ERRORS.VC_NOT_FOUND, ctx),
)(context);
