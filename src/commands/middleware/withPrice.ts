import { WithPriceMiddleware } from '../../types';
import { ErrorResponse } from '../responses';
import { awaitAnswer } from '../../utils/discord-common';

const ANSWER_TIME = 10000;

export const withPrice: WithPriceMiddleware = price => async (next, context) => {
  const {
    user,
    dispatch,
    message: { author, channel },
  } = context;

  await dispatch(`This command costs ${price} 💎. Type "yes" if you want to proceed.`);
  const answer = await awaitAnswer(author, channel, {
    correct: ['yes'],
    incorrect: ['no'],
    time: ANSWER_TIME,
  });

  if (!user || user.currency < price) {
    return new ErrorResponse(context, 'You don\'t have enough 💎');
  }

  if (!answer.message) {
    return null;
  }

  const result = await next(context);

  if (result instanceof ErrorResponse) {
    return result;
  }

  if (answer.message) {
    user.currency -= price;
    await user.save();
  }

  return result;
};
