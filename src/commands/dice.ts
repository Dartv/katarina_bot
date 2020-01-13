import random from 'random-int';
import { ICommand, ICommandHandler } from '../types';
import { COMMAND_TRIGGERS } from '../util';

const handler: ICommandHandler = async (context): Promise<string> => {
  const { args, message: { member } } = context;
  const sides = Number(args.sides);
  const min = 1;
  const max = Math.max(6, sides);
  return `${member.displayName} rolls ${random(min, max)}`;
};

export default (): ICommand => ({
  handler,
  triggers: COMMAND_TRIGGERS.DICE,
  parameters: [
    {
      name: 'sides',
      description: 'number of dice sides',
      optional: true,
      defaultValue: 6,
    },
  ],
  description: 'Roll the dice',
});
