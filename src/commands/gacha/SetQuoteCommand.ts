import { Command } from 'diskat';

import { Context, UserDocument } from '../../types';
import { Trigger, CommandGroupName, PriceTable } from '../../utils/constants';
import { injectUser, withPrice } from '../middleware';
import { SuccessResponse } from '../responses';

export interface SetQuoteCommandContext extends Context {
  user: UserDocument;
  args: {
    quote: string;
  };
}

const SetQuoteCommand: Command<SetQuoteCommandContext> = async (context): Promise<any> => {
  const { user, args: { quote } } = context;

  user.quote = quote;
  await user.save();

  return new SuccessResponse({
    title: 'Successfully set quote',
  }, context);
};

SetQuoteCommand.config = {
  triggers: Trigger.SET_QUOTE,
  description: 'Set your profile quote',
  parameters: [
    {
      name: 'quote',
      description: 'quote',
      literal: true,
    },
  ],
  middleware: [
    injectUser(),
    withPrice(PriceTable.SET_QUOTE),
  ],
  group: CommandGroupName.GACHA,
};

export default SetQuoteCommand;
