import { Attachment } from 'discord.js';

import { Command } from '../types';
import { COMMAND_TRIGGERS, Emoji } from '../util';
import { injectUser } from './middleware';
import { User, Character } from '../models';
import { ErrorResponse } from './responses';

const handler = async (context) => {
  try {
    const { user, args, message } = context;
    const searchName = args.name.join(' ').trim();
    const { characters } = await User.findById(user.id, { characters: 1 });
    const character = await Character.findOne({
      _id: { $in: characters },
      $text: {
        $search: searchName,
      },
    });

    if (!character) {
      return message.reply(`You have no waifu with name "${searchName}"`);
    }

    const {
      id,
      slug,
      imageUrl,
      stars,
      name,
    } = character;

    const count = characters.filter(_id => _id.toString() === id).length;
    const attachment = new Attachment(imageUrl, `${slug}.png`);
    const msg = `${name} x${count} ${Emoji.STAR.repeat(stars)}`;

    return message.reply(msg, attachment);
  } catch (err) {
    console.error(err);
    return ErrorResponse(`Couldn't fetch waifu ${context.args.name}`, context);
  }
};

export default (): Command => ({
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
