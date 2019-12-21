import { ICommand } from '../types';
import { COMMAND_TRIGGERS } from '../util';
import { injectUser } from './middleware';
import { Character } from '../models';
import { ErrorResponse } from './responses';
import { createCharacterEmbed } from '../models/character/util';

const handler = async (context) => {
  try {
    const {
      user,
      args,
      message,
      dispatch,
    } = context;
    const searchName = args.name.join(' ').trim();
    const character = await Character.findOne({
      _id: { $in: user.characters },
      $text: {
        $search: searchName,
      },
    }, {}, { sort: { stars: -1 } }).populate('series');

    if (!character) {
      await message.reply(`You have no waifu with name "${searchName}"`);
      return null;
    }

    const {
      id,
      imageUrl,
      stars,
      name,
      series,
    } = character;

    const count = user.characters.filter(_id => _id.toString() === id).length;
    const embed = createCharacterEmbed({
      name,
      imageUrl,
      series,
      stars,
      footer: { text: `You have x${count} of this waifu` },
    });

    return dispatch(embed);
  } catch (err) {
    console.error(err);
    return ErrorResponse(`Couldn't fetch waifu ${context.args.name}`, context);
  }
};

export default (): ICommand => ({
  middleware: [injectUser()],
  handler,
  triggers: COMMAND_TRIGGERS.MYWAIFU,
  description: 'Shows your waifu details',
  parameters: [
    {
      name: 'name',
      description: 'waifu name',
      repeatable: true,
    },
  ],
});
