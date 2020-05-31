import { ICommandContext } from 'ghastly';

import { IUser } from '../types';
import { SuccessResponse } from '../../../commands/responses/SuccessResponse';

const reward = async function (this: IUser, currency: number, title: string, context: ICommandContext): Promise<void> {
  const { dispatch } = context;

  this.currency += currency;
  await this.save();

  const response = new SuccessResponse(
    title,
    `You received ${currency}💎`,
    context,
  );
  await dispatch(response);
};

export default reward;
