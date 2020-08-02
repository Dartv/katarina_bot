import { Command, ParameterType } from 'diskat';
import { GuildMember } from 'discord.js';

import { Context } from '../../types';
import { Trigger, CommandGroupName } from '../../utils/constants';
import { randomInt } from '../../utils/common';

export interface LoveCommandContext extends Context {
  args: {
    member: GuildMember;
  };
}

const LoveCommand: Command<LoveCommandContext> = async (context) => {
  const {
    message: {
      member: me,
    },
    args: {
      member,
    },
  } = context;

  return `There's ${randomInt(0, 100)}% ♥️ between ${me.displayName} and ${member.displayName}`;
};

LoveCommand.config = {
  triggers: Trigger.LOVE,
  parameters: [
    {
      name: 'member',
      description: 'user to test',
      type: ParameterType.MEMBER,
    },
  ],
  description: 'Test how much love is there between you and a person',
  group: CommandGroupName.FUN,
};

export default LoveCommand;
