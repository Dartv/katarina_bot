import { ErrorResponse } from '../responses';
import { ERRORS } from '../../util/constants';

export default (
  COOLDOWN_TIME_IN_MS = 1000,
  message = ERRORS.CMD_CD,
) => {
  let cooldown = false;

  return async (next, context) => {
    if (cooldown) {
      return ErrorResponse(message, context);
    }

    cooldown = true;

    const timer = setTimeout(() => {
      cooldown = false;
    }, COOLDOWN_TIME_IN_MS);

    const clearCooldown = (): void => {
      cooldown = false;
      clearTimeout(timer);
    };

    return next({ ...context, clearCooldown });
  };
};
