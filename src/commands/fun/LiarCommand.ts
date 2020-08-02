import { Command, ParameterType } from 'diskat';
import { GuildMember } from 'discord.js';

import { Context } from '../../types';
import { Trigger, CommandGroupName } from '../../utils/constants';

export interface LiarCommandContext extends Context {
  args: {
    member: GuildMember;
  };
}

const LiarCommand: Command<LiarCommandContext> = async (context) => {
  const {
    args: {
      member,
    },
  } = context;

  return `${member.displayName} is ${Math.random() >= 0.5 ? 'lying' : 'not lying'}`;
};

LiarCommand.config = {
  triggers: Trigger.LIAR,
  parameters: [
    {
      name: 'member',
      description: 'user to test',
      type: ParameterType.MEMBER,
    },
  ],
  description: 'Test if the person is lying',
  group: CommandGroupName.FUN,
};

export default LiarCommand;
