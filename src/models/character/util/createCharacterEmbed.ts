import { RichEmbed } from 'discord.js';
import { pluck } from 'ramda';

import { ICharacter } from '../types';
import { COLORS, Emoji } from '../../../util';

interface ICreateCharacterEmbedInput {
  name: ICharacter['name'];
  imageUrl: ICharacter['imageUrl'];
  stars: ICharacter['stars'];
  series: ICharacter['series'];
  footer?: { text: string };
}

export default function createCharacterEmbed({
  name,
  imageUrl,
  stars,
  series,
  footer,
}: ICreateCharacterEmbedInput): RichEmbed {
  return new RichEmbed({
    title: name,
    image: { url: imageUrl },
    color: COLORS.INFO,
    footer,
    fields: [
      { name: 'Stars', value: Emoji.STAR.repeat(stars) },
      { name: 'Appears in', value: pluck('title', series as any[]).join(', ') || '...' },
    ],
  });
}
