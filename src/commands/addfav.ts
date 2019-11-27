import { Command } from '../types';
import { COMMAND_TRIGGERS } from '../util';
import { injectUser } from './middleware';
import { User, Character } from '../models';
import { ErrorResponse, SuccessResponse } from './responses';

const handler = async (context) => {
  const { user, args: { name } } = context;
  const waifuName = name.join(' ');
  try {
    const { characters } = await User.findById(user.id, { characters: 1 });
    const character = await Character.findOne({
      _id: { $in: characters },
      $text: {
        $search: waifuName,
      },
    }, { _id: 1, name: 1 });

    if (!character) return ErrorResponse(`Couldn't find ${waifuName} in your inventory`, context);

    await User.findByIdAndUpdate(user.id, {
      $addToSet: {
        favorites: character._id,
      },
    });
    return SuccessResponse(`Added ${character.name} to your favorites`, '', context);
  } catch (err) {
    console.error(err);
    return ErrorResponse(`Couldn't add ${waifuName} to your favorites`, context);
  }
};

export default (): Command => ({
  middleware: [injectUser()],
  handler,
  triggers: COMMAND_TRIGGERS.ADDFAV,
  description: 'Adds waifu to your favorites',
  parameters: [
    {
      name: 'name',
      description: 'waifu name',
      repeatable: true,
    },
  ],
});
