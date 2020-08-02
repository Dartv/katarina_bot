import { Message } from 'discord.js';
import { UserDocument, Context } from '../types';
import { SuccessResponse } from '../commands/responses';

export const rewardUser = async (
  options: {
    user: UserDocument;
    reward: number;
    context: Context;
    title: string;
  },
): Promise<Message> => {
  const {
    user,
    reward,
    context,
    title,
  } = options;
  user.currency += reward;
  await user.save();
  const response = new SuccessResponse(
    {
      title,
      description: `You received ${reward} 💎`,
    },
    context,
  );
  return context.dispatch(response);
};
