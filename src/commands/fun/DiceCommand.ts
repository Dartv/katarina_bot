import {
  Command,
  ParameterType,
  TypeResolver,
  expectGuild,
} from 'diskat';

import { Context } from '../../types';
import { Trigger, CommandGroupName } from '../../utils/constants';
import { randomInt } from '../../utils/common';

export interface DiceCommandContext extends Context {
  args: {
    sides: number;
  };
}

const MIN_SIDES = 6;

const DiceCommand: Command<DiceCommandContext> = async (context) => {
  const {
    args: {
      sides,
    },
    message: {
      member,
    },
  } = context;
  return `${member.displayName} rolls ${randomInt(1, sides)}`;
};

DiceCommand.config = {
  triggers: Trigger.DICE,
  parameters: [
    {
      name: 'sides',
      description: 'number of dice sides (6 min)',
      type: TypeResolver.compose(
        ParameterType.INTEGER,
        (sides: number) => Math.max(MIN_SIDES, sides),
      ),
      optional: true,
      defaultValue: MIN_SIDES,
    },
  ],
  description: 'Roll the dice',
  group: CommandGroupName.FUN,
  middleware: [
    expectGuild(),
  ],
};

export default DiceCommand;
