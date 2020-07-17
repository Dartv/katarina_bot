import { Command } from 'diskat';
import parseArgs, { Arguments } from 'yargs-parser';
import { MessageEmbed, Constants } from 'discord.js';

import {
  Trigger,
  PopularityThreshold,
  CharacterStar,
  AwakeningStage,
  CommandGroupName,
} from '../../utils/constants';
import {
  Context,
  UserDocument,
  CharacterDocument,
  SeriesDocument,
} from '../../types';
import { Character, UserCharacter, Series } from '../../models';
import { injectUser } from '../middleware';
import { renderCharacterStars, adjustStars, createCharacterEmbed } from '../../utils/character';

export interface SearchCommandContext extends Context {
  user: UserDocument;
  args: {
    searchTerm: string;
  };
}

export interface SearchCommandArguments extends Arguments {
  name?: string;
  series?: string;
  page?: number;
  stars?: number;
}

const LIMIT_PER_PAGE = 10;

const SearchCommand: Command<SearchCommandContext> = async (context) => {
  const {
    user,
    args: {
      searchTerm,
    },
    message,
    formatter,
  } = context;
  const argv: SearchCommandArguments = parseArgs(searchTerm);
  const charactersSearchTerm = argv.name || argv._.join(' ');
  const { page = 1 } = argv;
  let series: SeriesDocument[] = [];
  let characters: CharacterDocument[] = [];

  if (argv.series) {
    series = await Series
      .find({
        $text: {
          $search: argv.series,
        },
      })
      .limit(10)
      .select('_id');
  }

  if (charactersSearchTerm || argv.series) {
    characters = await Character
      .find({
        ...(argv.series && { series: { $in: series.map(({ _id }) => _id) } }),
        ...(charactersSearchTerm && {
          $text: {
            $search: charactersSearchTerm,
          },
        }),
      })
      .select('_id');
  }

  const userCharacters = await UserCharacter.aggregate([
    {
      $match: {
        user: user._id,
      },
    },
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
    ...((charactersSearchTerm || argv.series) ? [
      {
        $match: {
          'character._id': { $in: characters.map(({ _id }) => _id) },
        },
      },
    ] : []),
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
          $add: ['$baseStars', '$additionalStars'],
        },
      },
    },
    ...(argv.stars ? [
      {
        $match: {
          stars: adjustStars(argv.stars),
        },
      },
    ] : []),
    { $skip: LIMIT_PER_PAGE * (page - 1) },
    { $limit: LIMIT_PER_PAGE },
    {
      $lookup: {
        from: 'series',
        as: 'character.series',
        localField: 'character.series',
        foreignField: '_id',
      },
    },
  ]);

  if (!userCharacters.length) {
    return message.reply('Your search term did not match anything');
  }

  if (userCharacters.length === 1) {
    const userCharacter = userCharacters[0];
    const embed = createCharacterEmbed({
      ...userCharacter.character,
      ...userCharacter,
    }).setFooter(`You have x${userCharacter.count} of this character`);
    return message.reply('', { embed });
  }

  const embed = new MessageEmbed()
    .setTitle('Search Results')
    .setFooter(`Page: ${page}`)
    .setColor(Constants.Colors.BLUE);

  userCharacters.forEach((userCharacter) => {
    const character = userCharacter.character as CharacterDocument;
    const characterSeries = character.series as SeriesDocument[];
    const description = [
      renderCharacterStars(userCharacter.stars, userCharacter.additionalStars),
      `${formatter.bold('Appears in')}: ${characterSeries.map(({ title }) => title).join(', ')}`,
    ].join('\n');

    embed.addField(character.name, description);
  });

  return message.reply('', { embed });
};

SearchCommand.config = {
  triggers: Trigger.SEARCH,
  description: 'Search for characters',
  parameters: [
    {
      name: 'searchTerm',
      description: 'search term',
      optional: true,
      literal: true,
      defaultValue: '',
    },
  ],
  middleware: [
    injectUser(),
  ],
  group: CommandGroupName.GACHA,
};

export default SearchCommand;
