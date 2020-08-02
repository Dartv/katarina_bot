import { Command, expectGuild } from 'diskat';

import { Context } from '../../types';
import { Trigger, CommandGroupName } from '../../utils/constants';

const SudokuCommand: Command<Context> = async (context) => {
  const {
    message: {
      member,
    },
  } = context;
  return `${member.displayName} commits honorable sudoku. RIP ${member.displayName} ⚰️`;
};

SudokuCommand.config = {
  triggers: Trigger.SUDOKU,
  description: 'Commit honorable sudoku',
  group: CommandGroupName.FUN,
  middleware: [
    expectGuild(),
  ],
};

export default SudokuCommand;
