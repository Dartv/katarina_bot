import { defaultTo } from 'ramda';

import { ICommand, ICommandHandler } from '../types';
import { COMMAND_TRIGGERS } from '../util';
import { injectUser } from './middleware';
import { Character, CharacterInfo } from '../models';
import { ErrorResponse } from './responses';
import { createCharacterEmbed } from '../models/character/util';
import { ICharacterInfo } from '../models/characterInfo/types';

const handler: ICommandHandler = async (context) => {
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
      slug,
    } = character;

    const { level, exp }: Partial<ICharacterInfo> = await CharacterInfo.findOne({
      character: character._id,
      user: user._id,
    }).map(defaultTo({}));

    const count = user.characters.filter(_id => _id.toString() === id).length;
    const embed = createCharacterEmbed({
      name,
      imageUrl,
      series,
      stars,
      level,
      exp,
      footer: { text: `You have x${count} of this waifu | ${slug}` },
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
