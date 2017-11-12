import R from 'ramda';

import { ErrorResponse } from '../responses';
import { ERRORS } from '../../util/constants';
import { lenses } from '../../util';

export default () => async (next, context) => R.ifElse(
  R.view(lenses.message.guild.voiceConnection),
  next,
  ErrorResponse(ERRORS.VC_NOT_FOUND),
)(context);

