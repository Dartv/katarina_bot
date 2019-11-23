import R from 'ramda';
import { Response } from 'ghastly/command';

export class ErrorResponse extends Response {
  constructor(error) {
    super(async () => error);
  }
}

export default R.constructN(2, ErrorResponse);
