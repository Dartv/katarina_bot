import { RichEmbed } from 'discord.js';
import { pluck } from 'ramda';

import { ICharacter } from '../types';
import { Emoji, EXPToLVLUp, EmbedLimit } from '../../../util';
import { getColorByStars } from '../../../util/color';

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
  description,
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
    description: description ? description.slice(0, EmbedLimit.DESCRIPTION - 3).concat('...') : undefined,
    ...(imageUrl && { image: { url: imageUrl } }),
    color: getColorByStars(stars),
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
