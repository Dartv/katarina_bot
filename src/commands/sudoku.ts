import { ICommand, ICommandHandler } from 'ghastly';
import { COMMAND_TRIGGERS } from '../util';

const handler: ICommandHandler = async (context): Promise<string> => {
  const { message: { member } } = context;

  return `${member.displayName} commits honorable sudoku. RIP ${member.displayName} ⚰️`;
};

export default (): ICommand => ({
  handler,
  triggers: COMMAND_TRIGGERS.SUDOKU,
  description: 'Commit honorable sudoku',
});
