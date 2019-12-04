import { expectUser } from 'ghastly/lib/middleware';
import { RichEmbed } from 'discord.js';
import { pluck } from 'ramda';

import { ICommand } from '../types';
import { COMMAND_TRIGGERS, COLORS, Emoji } from '../util';
import Character, { ICharacter } from '../models/character';

interface ICreateCharacterEmbedInput {
  name: ICharacter['name'];
  imageUrl: ICharacter['imageUrl'];
  stars: ICharacter['stars'];
  series: ICharacter['series'];
}

const getRandomCharacters = async ({ stars }: { stars: number }): Promise<ICharacter[]> => {
  const characters = await Character.aggregate([
    {
      $match: { stars },
    },
    { $sample: { size: 2 } },
    {
      $lookup: {
        from: 'series',
        as: 'series',
        localField: 'series',
        foreignField: '_id',
      },
    },
  ]);
  return characters;
};

const createCharacterEmbed = ({
  name,
  imageUrl,
  stars,
  series,
}: ICreateCharacterEmbedInput): RichEmbed => new RichEmbed({
  title: name,
  image: { url: imageUrl },
  color: COLORS.INFO,
  fields: [
    { name: 'Stars', value: Emoji.STAR.repeat(stars) },
    { name: 'Appears in', value: pluck('title', series as any[]).join(', ') },
  ],
});

const middleware = [
  expectUser(process.env.SUPER_ADMIN_ID),
];

const handler = async (context) => {
  const { dispatch, args: { stars } } = context;
  try {
    const characters = await getRandomCharacters({ stars: Number(stars) });
    await dispatch('Who is a better waifu?');
    const messages = await Promise.all(
      characters.map(character => dispatch(createCharacterEmbed(character))),
    );
    await Promise.all(
      messages.map(msg => msg.react('❤️')),
    );
  } catch (err) {
    console.error(err);
  }
};

export default (): ICommand => ({
  middleware,
  handler,
  triggers: COMMAND_TRIGGERS.VERSUS,
  description: 'Waifu versus battle',
  parameters: [
    {
      name: 'stars',
      description: 'stars',
      defaultValue: 5,
      optional: true,
    },
  ],
});
