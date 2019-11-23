import R from 'ramda';

import { ErrorResponse } from '../responses';
import { lenses } from '../../util';
import { ERRORS } from '../../util/constants';

export default () => async (next, context) => R.ifElse(
  R.view(lenses.message.guild.voiceConnection.player.dispatcher as any),
  next,
  ctx => ErrorResponse(ERRORS.VC_NOT_PLAYING, ctx),
)(context);
