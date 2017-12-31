import { ErrorResponse } from '../responses';
import { ERRORS } from '../../util/constants';

export default (
  COOLDOWN_TIME_IN_MS = 5000,
  message = ERRORS.CMD_CD,
) => {
  let COOLDOWN_AT;

  return async (next, context) => {
    if (COOLDOWN_AT && (Date.now() - COOLDOWN_AT) < COOLDOWN_TIME_IN_MS) {
      return ErrorResponse(message, context);
    }

    COOLDOWN_AT = Date.now();

    return next(context);
  };
};
