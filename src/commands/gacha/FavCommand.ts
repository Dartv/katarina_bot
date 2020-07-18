import { Command, TypeResolver, ParameterType } from 'diskat';

import { Context, UserDocument } from '../../types';
import { Trigger, CommandGroupName } from '../../utils/constants';
import { injectUser } from '../middleware';
import { UserCharacter, Character } from '../../models';
import { ErrorResponse, SuccessResponse } from '../responses';

export enum FavCommandOption {
  ADD = 'add',
  DEL = 'remove',
}

export interface FavCommandContext extends Context {
  user: UserDocument;
  args: {
    option: FavCommandOption;
    slug: string;
  };
}

const FavCommand: Command<FavCommandContext> = async (context): Promise<any> => {
  const {
    args: {
      option,
      slug,
    },
    user,
  } = context;
  const character = await Character.findOne({ slug });

  if (!character) {
    return new ErrorResponse(context, `Character "${slug}" does not exist`);
  }

  const userCharacter = await UserCharacter.findOne({
    character: character._id,
    user: user._id,
  });

  if (!userCharacter) {
    return new ErrorResponse(context, `Could not find "${slug}" among your characters`);
  }

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
