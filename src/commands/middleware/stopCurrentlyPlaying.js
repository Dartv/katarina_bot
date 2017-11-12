import R from 'ramda';

import { lenses } from '../../util';
import { ErrorResponse } from '../responses';

export default () => async (next, context) => {
  try {
    await R.view(lenses.message.guild.voiceConnection.player.dispatcher.end, context);
  } catch (err) {
    return ErrorResponse(err.message, context);
  }

  return next(context);
};
