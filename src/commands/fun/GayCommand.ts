import {
  ParameterType,
  Command,
} from 'diskat';
import { GuildMember } from 'discord.js';

import type { Context } from '../../types';
import { Trigger, CommandGroupName } from '../../utils/constants';
import { randomInt } from '../../utils/common';

export interface GayCommandContext extends Context {
  args: {
    member: GuildMember;
  };
}

const GayCommand: Command<GayCommandContext> = async ({ args: { member } }) => (
  `${member.displayName} is ${randomInt(0, 100)}% gay 🏳️‍🌈`
);

GayCommand.config = {
  triggers: Trigger.GAY,
  parameters: [
    {
      name: 'member',
      description: 'user to test',
      type: ParameterType.MEMBER,
    },
  ],
  description: 'Test how gay is a person?',
  group: CommandGroupName.FUN,
};

export default GayCommand;
