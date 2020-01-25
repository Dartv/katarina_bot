import { ICommand, ICommandHandler } from 'ghastly';
import { COMMAND_TRIGGERS } from '../util';
import { injectUser } from './middleware';
import { User, Character } from '../models';
import { ErrorResponse, SuccessResponse } from './responses';

const handler: ICommandHandler = async (context) => {
  const { user, args: { name } } = context;
  const waifuName = name.join(' ');
  try {
    const character = await Character.findOne({
      _id: { $in: user.characters },
      $text: {
        $search: waifuName,
      },
    }, { _id: 1, name: 1 });

    if (!character) return ErrorResponse(`Couldn't find ${waifuName} in your inventory`, context);

    await User.findByIdAndUpdate(user.id, {
      $pull: {
        favorites: character._id,
      },
    });

    return SuccessResponse(`Removed ${character.name} from your favorites`, '', context);
  } catch (err) {
    console.error(err);
    return ErrorResponse(`Couldn't remove ${waifuName} from your favorites`, context);
  }
};

export default (): ICommand => ({
  middleware: [injectUser()],
  handler,
  triggers: COMMAND_TRIGGERS.DELFAV,
  description: 'Deletes waifu from your favorites',
  parameters: [
    {
      name: 'name',
      description: 'waifu name',
      repeatable: true,
    },
  ],
});
