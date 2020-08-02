import { Command, TypeResolver, ParameterType } from 'diskat';

import { Context, UserDocument, WithUserCharacterMiddlewareContext } from '../../types';
import { Trigger, CommandGroupName } from '../../utils/constants';
import { injectUser, withUserCharacter } from '../middleware';
import { SuccessResponse } from '../responses';

export enum FavCommandOption {
  ADD = 'add',
  DEL = 'remove',
}

export interface FavCommandContextBase extends Context {
  user: UserDocument;
  args: {
    option: FavCommandOption;
    slug: string;
  };
}
export type FavCommandContext = FavCommandContextBase & WithUserCharacterMiddlewareContext;

const FavCommand: Command<FavCommandContext> = async (context): Promise<any> => {
  const {
    args: {
      option,
    },
    user,
    userCharacter,
  } = context;
  const { character } = userCharacter;

  switch (option) {
    case FavCommandOption.ADD: {
      user.favorites.addToSet(character._id);
      await user.save();
      return new SuccessResponse({
        title: `Added "${character.name}" to your favorites`,
      }, context);
    }
    case FavCommandOption.DEL: {
      user.favorites.pull(character._id);
      await user.save();
      return new SuccessResponse({
        title: `Removed "${character.name}" from your favorites`,
      }, context);
    }
    default:
      return null;
  }
};

FavCommand.config = {
  triggers: Trigger.FAV,
  middleware: [
    injectUser(),
    withUserCharacter(async ({ user, args: { slug } }: FavCommandContextBase) => ({
      slug,
      user,
    })),
  ],
  parameters: [
    {
      name: 'option',
      description: Object.values(FavCommandOption).join('/'),
      type: TypeResolver.oneOf(
        ParameterType.STRING_LOWER,
        Object.values(FavCommandOption),
      ),
    },
    {
      name: 'slug',
      description: 'character identifier',
      type: ParameterType.STRING_LOWER,
    },
  ],
  description: 'Add or remove favorite characters',
  group: CommandGroupName.GACHA,
};

export default FavCommand;
