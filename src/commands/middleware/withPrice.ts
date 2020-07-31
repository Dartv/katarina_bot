import { WithPriceMiddleware } from '../../types';
import { ErrorResponse } from '../responses';
import { awaitAnswer } from '../../utils/discord-common';

const ANSWER_TIME = 10000;

export const withPrice: WithPriceMiddleware = config => async (next, context) => {
  const {
    user,
    dispatch,
    message: { author, channel },
  } = context;
  const { price, silent } = typeof config === 'function'
    ? await config(context)
    : { price: config, silent: false };

  if (!silent) {
    await dispatch(`This command costs ${price} 💎. Type "yes" if you want to proceed.`);
    const answer = await awaitAnswer(author, channel, {
      correct: ['yes'],
      incorrect: ['no'],
      time: ANSWER_TIME,
    });

    if (!answer.message) {
      return null;
    }
  }

  if (!user || user.currency < price) {
    return new ErrorResponse(context, 'You don\'t have enough 💎');
  }

  const result = await next(context);

  if (result instanceof ErrorResponse) {
    return result;
  }

  user.currency -= price;
  await user.save();

  return result;
};
