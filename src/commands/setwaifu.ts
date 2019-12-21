import { ICommand } from '../types';
import { COMMAND_TRIGGERS } from '../util';
import { injectUser } from './middleware';
import { Character } from '../models';
import { createCharacterEmbed } from '../models/character/util';
import { ErrorResponse } from './responses';

const handler = async (context): Promise<any> => {
  const { message, user, args } = context;
  const name = args.name.join(' ').trim();
  try {
    const character = await Character.findOne({
      _id: { $in: user.characters },
      $text: {
        $search: name,
      },
    }, {}, { sort: { stars: -1 } }).populate('series');

    if (!character) {
      return ErrorResponse(`You have no waifu with name "${name}"`, context);
    }

    user.waifu = character._id;

    await user.save();

    const embed = createCharacterEmbed(character);

    await message.reply(`Set ${name} as your profile waifu`, { embed });

    return null;
  } catch (err) {
    console.error(err);
    return ErrorResponse(`Couldn't set ${name} as your profile waifu`, context);
  }
};

export default (): ICommand => ({
  middleware: [injectUser()],
  handler,
  triggers: COMMAND_TRIGGERS.SET_WAIFU,
  description: 'Sets your profile waifu',
  parameters: [
    {
      name: 'name',
      description: 'waifu name',
      repeatable: true,
    },
  ],
});
