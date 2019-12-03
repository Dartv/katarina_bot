import { RichEmbed } from 'discord.js';
import { pluck } from 'ramda';

import { ICommand } from '../types';
import { COMMAND_TRIGGERS, Emoji, COLORS } from '../util';
import { injectUser } from './middleware';
import { Character } from '../models';
import { ErrorResponse } from './responses';

const handler = async (context) => {
  try {
    const { user, args, message } = context;
    const searchName = args.name.join(' ').trim();
    const character = await Character.findOne({
      _id: { $in: user.characters },
      $text: {
        $search: searchName,
      },
    }).populate('series');

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
    const embed = new RichEmbed({
      title: name,
      image: { url: imageUrl },
      footer: { text: `You have x${count} of this waifu` },
      color: COLORS.INFO,
      fields: [
        { name: 'Stars', value: Emoji.STAR.repeat(stars) },
        { name: 'Appears in', value: pluck('title', series as any[]).join(', ') },
      ],
    });

    await message.reply(embed);
    return null;
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
