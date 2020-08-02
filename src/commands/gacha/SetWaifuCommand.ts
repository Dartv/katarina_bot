import { Command } from 'diskat';
import { Trigger, CommandGroupName, PriceTable } from '../../utils/constants';
import { injectUser, withUserCharacter, withPrice } from '../middleware';
import { Context, UserDocument, WithUserCharacterMiddlewareContext } from '../../types';
import { SuccessResponse } from '../responses';

export interface SetWaifuCommandContextBase extends Context {
  user: UserDocument;
  args: {
    slug: string;
  };
}
export type SetWaifuCommandContext = SetWaifuCommandContextBase & WithUserCharacterMiddlewareContext;

const SetWaifuCommand: Command<SetWaifuCommandContext> = async (context): Promise<any> => {
  const { user, userCharacter } = context;

  user.waifu = userCharacter.character._id;
  await user.save();

  return new SuccessResponse({
    title: `Sucessfully set "${userCharacter.character.name}" as your waifu`,
  }, context);
};

SetWaifuCommand.config = {
  triggers: Trigger.SET_WAIFU,
  description: 'Set your profile character',
  middleware: [
    injectUser(),
    withPrice(PriceTable.SET_WAIFU),
    withUserCharacter(async ({ user, args: { slug } }: SetWaifuCommandContextBase) => ({
      slug,
      user,
    })),
  ],
  parameters: [
    {
      name: 'slug',
      description: 'character identifier',
    },
  ],
  group: CommandGroupName.GACHA,
};

export default SetWaifuCommand;
