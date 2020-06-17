import { RichEmbed } from 'discord.js';
import { pluck } from 'ramda';

import {
  CharacterStar,
  PopularityThreshold,
  Emoji,
  EXPToLVLUp,
  EmbedLimit,
  AwakeningStage,
} from '../../util';
import { ICharacter } from './types';
import { getColorByStars } from '../../util/color';

interface ICreateCharacterEmbedInput extends Partial<RichEmbed> {
  name: ICharacter['name'];
  imageUrl: ICharacter['imageUrl'];
  stars: ICharacter['stars'];
  series: ICharacter['series'];
  footer?: { text: string };
  level?: number;
  exp?: number;
  additionalStars?: number;
}

const renderStars = (stars: CharacterStar, additionalStars: number): string => {
  if (!additionalStars) {
    return Emoji.STAR.repeat(stars);
  }

  return `${Emoji.STAR2.repeat(stars - additionalStars)}${Emoji.STAR_EMPTY.repeat(additionalStars)}`;
};

export const createCharacterEmbed = ({
  name,
  description,
  imageUrl,
  stars,
  series = [],
  footer,
  fields = [],
  level,
  exp,
  additionalStars = 0,
  ...rest
}: ICreateCharacterEmbedInput): RichEmbed => new RichEmbed({
  title: name,
  description: description ? description.slice(0, EmbedLimit.DESCRIPTION - 3).concat('...') : undefined,
  ...(imageUrl && { image: { url: imageUrl } }),
  color: getColorByStars(stars),
  footer,
  fields: [
    {
      name: 'Stars',
      value: renderStars(stars, additionalStars),
    },
    ...(
      series.length
        ? [{
          name: 'Appears in',
          value: pluck('title', series).join(', ') || '...',
        }]
        : []
    ),
    ...(level ? [{ name: 'Level', value: level.toString(), inline: true }] : []),
    ...(exp ? [{ name: 'Exp', value: `${exp}/${EXPToLVLUp[level + 1]}`, inline: true }] : []),
    ...fields,
  ],
  ...rest,
});

export const getCharacterStarRating = (popularity: number): CharacterStar => {
  if (popularity <= PopularityThreshold.FIVE_STAR) return CharacterStar.FIVE_STAR;
  if (popularity <= PopularityThreshold.FOUR_STAR) return CharacterStar.FOUR_STAR;
  if (popularity <= PopularityThreshold.THREE_STAR) return CharacterStar.THREE_STAR;
  return CharacterStar.TWO_STAR;
};

export const getCharacterAdditionalStars = (copies: number): CharacterStar => {
  if (copies >= AwakeningStage.THIRD) return 3;

  if (copies >= AwakeningStage.SECOND) return 2;

  if (copies >= AwakeningStage.FIRST) return 1;

  return 0;
};
