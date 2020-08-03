import { MessageEmbed, Constants, User } from 'discord.js';

import {
  CharacterStar,
  PopularityThreshold,
  AwakeningStage,
  Emoji,
} from './constants';
import {
  CharacterEmbedOptions,
  UserCharacterDocument,
  CharacterDocument,
  UserDocument,
  Participant,
} from '../types';
import { resolveEmbedDescription, awaitAnswer } from './discord-common';
import { clamp } from './common';

const { Colors } = Constants;

export const getCharacterStarRating = (popularity: number): CharacterStar => {
  if (popularity <= PopularityThreshold.FIVE_STAR) return CharacterStar.FIVE_STAR;
  if (popularity <= PopularityThreshold.FOUR_STAR) return CharacterStar.FOUR_STAR;
  if (popularity <= PopularityThreshold.THREE_STAR) return CharacterStar.THREE_STAR;
  return CharacterStar.TWO_STAR;
};

export const getPopularityRangeByStarRating = (stars: CharacterStar): [number, number] => {
  switch (clamp(CharacterStar.TWO_STAR, CharacterStar.FIVE_STAR, stars)) {
    case CharacterStar.FIVE_STAR:
      return [1, PopularityThreshold.FIVE_STAR];
    case CharacterStar.FOUR_STAR:
      return [PopularityThreshold.FIVE_STAR, PopularityThreshold.FOUR_STAR];
    case CharacterStar.THREE_STAR:
      return [PopularityThreshold.FOUR_STAR, PopularityThreshold.THREE_STAR];
    case CharacterStar.TWO_STAR:
    default:
      return [PopularityThreshold.THREE_STAR, PopularityThreshold.TWO_STAR];
  }
};

export const getCharacterAdditionalStars = (copies: number): CharacterStar => {
  if (copies >= AwakeningStage.THIRD) return 3;

  if (copies >= AwakeningStage.SECOND) return 2;

  if (copies >= AwakeningStage.FIRST) return 1;

  return 0;
};

export const getColorByStars = (stars: CharacterStar): number => {
  switch (stars) {
    case CharacterStar.THREE_STAR:
      return Colors.GREEN;
    case CharacterStar.FOUR_STAR:
      return Colors.BLUE;
    case CharacterStar.FIVE_STAR:
      return Colors.GOLD;
    case CharacterStar.SIX_STAR:
      return Colors.PURPLE;
    case CharacterStar.TWO_STAR:
    default:
      return Colors.WHITE;
  }
};

export const renderCharacterStars = (stars: CharacterStar, additionalStars?: number): string => {
  if (additionalStars) {
    return `${Emoji.STAR_FULL.repeat(stars - additionalStars)}${Emoji.STAR_EMPTY.repeat(additionalStars)}`;
  }

  return Emoji.STAR_DEFAULT.repeat(stars);
};

export const createCharacterEmbed = (options: CharacterEmbedOptions): MessageEmbed => {
  const {
    name,
    description = '',
    imageUrl = '',
    series = [],
    stars,
    additionalStars = 0,
    color = getColorByStars(stars),
  } = options;
  const embed = new MessageEmbed({
    title: name,
    color,
  });

  if (description) {
    embed.setDescription(resolveEmbedDescription(description));
  }

  if (imageUrl) {
    embed.setImage(imageUrl);
  }

  if (stars) {
    embed.addField(
      'Stars',
      renderCharacterStars(stars, additionalStars),
    );
  }

  if (series.length) {
    const appearsIn = series.map(({ title }) => title).join(', ');
    embed.addField('Appears in', appearsIn);
  }

  return embed;
};

export const adjustStars = (stars: number): CharacterStar => clamp(
  CharacterStar.TWO_STAR,
  CharacterStar.SIX_STAR,
  stars,
);

export const getUserCharactersWithStarsPipeline = (): Record<string, any>[] => [
  {
    $lookup: {
      from: 'characters',
      as: 'character',
      localField: 'character',
      foreignField: '_id',
    },
  },
  {
    $unwind: '$character',
  },
  {
    $addFields: {
      baseStars: {
        $switch: {
          branches: [
            {
              case: {
                $lte: ['$character.popularity', PopularityThreshold.FIVE_STAR],
              },
              then: CharacterStar.FIVE_STAR,
            },
            {
              case: {
                $and: [
                  { $gt: ['$character.popularity', PopularityThreshold.FIVE_STAR] },
                  { $lte: ['$character.popularity', PopularityThreshold.FOUR_STAR] },
                ],
              },
              then: CharacterStar.FOUR_STAR,
            },
            {
              case: {
                $and: [
                  { $gt: ['$character.popularity', PopularityThreshold.FOUR_STAR] },
                  { $lte: ['$character.popularity', PopularityThreshold.THREE_STAR] },
                ],
              },
              then: CharacterStar.THREE_STAR,
            },
            {
              case: {
                $gt: ['$character.popularity', PopularityThreshold.THREE_STAR],
              },
              then: CharacterStar.TWO_STAR,
            },
          ],
          default: CharacterStar.TWO_STAR,
        },
      },
      additionalStars: {
        $switch: {
          branches: [
            { case: { $gte: ['$count', AwakeningStage.THIRD] }, then: 3 },
            { case: { $gte: ['$count', AwakeningStage.SECOND] }, then: 2 },
            { case: { $gte: ['$count', AwakeningStage.FIRST] }, then: 1 },
          ],
          default: 0,
        },
      },
    },
  },
  {
    $addFields: {
      stars: {
        $min: [
          { $add: ['$baseStars', '$additionalStars'] },
          CharacterStar.SIX_STAR,
        ],
      },
    },
  },
];

export const fight = (c1: UserCharacterDocument, c2: UserCharacterDocument): boolean => (
  c1.stars > c2.stars || (c1.character as CharacterDocument).popularity < (c2.character as CharacterDocument).popularity
);

export const battle = (characters: UserCharacterDocument[]): UserCharacterDocument[] => characters.sort(
  (a, b) => fight(a, b) ? -1 : 1,
);

export const pickCharacter = async (
  user: UserDocument,
  author: User,
  attempt = 0,
  prev?: UserCharacterDocument,
): Promise<UserCharacterDocument> => {
  if (attempt >= 5) {
    return prev;
  }

  const [userCharacter] = await user.characters.fetchRandom(1);

  await author.send(
    'Do you want to pick this character? Type "yes" or "no"',
    {
      embed: createCharacterEmbed({
        ...userCharacter.toObject(),
        ...(userCharacter.character as CharacterDocument).toObject(),
      }),
    },
  );

  const answer = await awaitAnswer(author, author.dmChannel, {
    correct: ['yes'],
    incorrect: ['no'],
  });

  if (answer.message || answer.error) {
    return userCharacter;
  }

  return pickCharacter(user, author, attempt + 1, userCharacter);
};

export const createParticipantEmbed = (
  participant: Participant,
): MessageEmbed => {
  const character = participant.userCharacter.character as CharacterDocument;
  const embed = createCharacterEmbed({
    ...participant.userCharacter.toObject(),
    ...character.toObject(),
  })
    .setAuthor(participant.author.username, participant.author.avatarURL())
    .setThumbnail(character.imageUrl)
    .setImage(null);
  return embed;
};
