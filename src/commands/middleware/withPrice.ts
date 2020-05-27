import { Middleware } from 'ghastly';
import { Error } from 'mongoose';
import { ErrorResponse } from '../responses/ErrorResponse';

enum Answer {
  YES = 'yes',
  NO = 'no',
}

const withPrice = (price: number): Middleware => async (next, context) => {
  const { user, message } = context;
  const { channel } = message;

  if (user?.settings?.displayRollPrice) {
    await message.reply(`This command costs ${price}💎. Type "yes" if you want to proceed.`);

    try {
      const collectedMessages = await channel.awaitMessages(
        ({
          content,
          member,
        }) => member?.id === message.member?.id && Object.values(Answer).includes(content.toLowerCase()),
        {
          time: 10000,
          maxMatches: 1,
          errors: ['time'],
        },
      );
      const collectedMessage = collectedMessages.first();

      if (collectedMessage?.content?.toLowerCase() === Answer.NO) {
        return null;
      }
    } catch (err) {
      return new ErrorResponse('No answer. Skipping...', context);
    }
  }

  if (user) {
    try {
      user.currency -= price;
      await user.save();
    } catch (err) {
      if (err instanceof Error.ValidationError) {
        return new ErrorResponse('You don\'t have enough 💎', context);
      }
      throw err;
    }
  }

  return next(context);
};

export default withPrice;
