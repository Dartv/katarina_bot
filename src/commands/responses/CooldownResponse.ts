import { formatDistanceStrict } from 'date-fns';

import { ErrorResponse } from './ErrorResponse';
import { Context } from '../../types';

export class CooldownResponse extends ErrorResponse {
  constructor(context: Context, cooldown: Date | number) {
    super(
      context,
      `This command is on a cooldown. \
        Please wait ${formatDistanceStrict(Date.now(), cooldown)}.`,
    );
  }
}
