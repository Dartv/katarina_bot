import { RichEmbed } from 'discord.js';
import { pluck } from 'ramda';

import { ICharacter } from '../types';
import { COLORS, Emoji, EXPToLVLUp } from '../../../util';

interface ICreateCharacterEmbedInput extends Partial<RichEmbed> {
  name: ICharacter['name'];
  imageUrl: ICharacter['imageUrl'];
  stars: ICharacter['stars'];
  series: ICharacter['series'];
  footer?: { text: string };
  level?: number;
  exp?: number;
}

export default function createCharacterEmbed({
  name,
  imageUrl,
  stars,
  series = [],
  footer,
  fields = [],
  level,
  exp,
  ...rest
}: ICreateCharacterEmbedInput): RichEmbed {
  return new RichEmbed({
    title: name,
    ...(imageUrl && { image: { url: imageUrl } }),
    color: COLORS.INFO,
    footer,
    fields: [
      { name: 'Stars', value: Emoji.STAR.repeat(stars) },
      { name: 'Appears in', value: pluck('title', series as any[]).join(', ') || '...' },
      ...(level ? [{ name: 'Level', value: level.toString(), inline: true }] : []),
      ...(exp ? [{ name: 'Exp', value: `${exp}/${EXPToLVLUp[level + 1]}`, inline: true }] : []),
      ...fields,
    ],
    ...rest,
  });
}
