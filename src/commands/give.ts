import { ICommand, ICommandHandler } from 'ghastly';
import { expectUser } from 'ghastly/lib/middleware';

import { COMMAND_TRIGGERS } from '../util';
import { User } from '../models';

const handler: ICommandHandler = async (context): Promise<void> => {
  const { message: { mentions }, args: { amount } } = context;

  if (!mentions.members.size) return;

  const member = mentions.members.first();
  const user = await User.findOneByDiscordId(member.id);

  if (user) {
    await user.reward(Number.parseInt(amount, 10), 'Transfer completed', context);
  }
};

export default (): ICommand => ({
  handler,
  middleware: [
    expectUser(process.env.SUPER_ADMIN_ID),
  ],
  triggers: COMMAND_TRIGGERS.GIVE,
  parameters: [
    {
      name: 'user',
      description: 'user mention',
    },
    {
      name: 'amount',
      description: 'amount to give',
    },
  ],
  description: 'Give a user points (only for super admin)',
});
