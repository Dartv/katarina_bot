import { CommandConfigurator, CommandHandler, ParameterType, Context } from 'diskat';
import { GuildMember } from 'discord.js';

import { Trigger } from '../../utils/constants';
import { randomInt } from '../../utils/common';

export interface GayCommandContext extends Context {
  args: {
    member: GuildMember;
  };
}

export const handler: CommandHandler<GayCommandContext, string> = async ({ args: { member } }) => (
  `${member.displayName} is ${randomInt(0, 100)}% gay 🏳️‍🌈`
);

export const GayCommand: CommandConfigurator = () => ({
  handler,
  triggers: Trigger.GAY,
  parameters: [
    {
      name: 'member',
      type: ParameterType.MEMBER,
    },
  ],
  description: 'How gay is someone?',
  group: 'fun',
});
