import { Command } from 'diskat';
import parseArgs, { Arguments } from 'yargs-parser';
import { MessageEmbed, Constants } from 'discord.js';
import { Types } from 'mongoose';

import {
  Trigger,
  CommandGroupName,
} from '../../utils/constants';
import {
  Context,
  UserDocument,
  CharacterBase,
  SeriesBase,
} from '../../types';
import { injectUser, withInMemoryCooldown } from '../middleware';
import { renderCharacterStars, createCharacterEmbed } from '../../utils/character';
import { Character, Series } from '../../models';

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
  favorites?: boolean;
  global?: boolean;
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

  if (argv.global) {
    const series = argv.series ? await Series.search({
      searchTerm: argv.series,
      project: {
        _id: 1,
      },
      limit: 10,
    }) : [];

    const characters = await Character.search<CharacterBase & { series: SeriesBase[] }>({
      searchTerm: charactersSearchTerm,
      skip: LIMIT_PER_PAGE * (page - 1),
      limit: LIMIT_PER_PAGE,
      populate: true,
      ...(argv.series && {
        series: series.map(({ _id }) => _id),
      }),
    });

    if (!characters.length) {
      return message.reply('Your search term did not match anything');
    }

    if (characters.length === 1) {
      const embed = createCharacterEmbed(characters[0]);
      return message.reply('', { embed });
    }

    const embed = new MessageEmbed()
      .setTitle('Search Results')
      .setFooter(`Page: ${page}`)
      .setColor(Constants.Colors.BLUE);

    characters.forEach((character) => {
      embed.addField(
        character.name,
        `${formatter.bold('Appears in')}: ${character?.series.map(({ title }) => title).join(', ') || ''}`,
      );
    });

    return message.reply('', { embed });
  }

  const userCharacters = await user.searchCharacters({
    name: charactersSearchTerm,
    series: argv.series,
    stars: argv.stars,
    skip: LIMIT_PER_PAGE * (page - 1),
    limit: LIMIT_PER_PAGE,
    ids: argv.favorites ? user.favorites as Types.ObjectId[] : undefined,
  });

  if (!userCharacters.length) {
    return message.reply('Your search term did not match anything');
  }

  if (userCharacters.length === 1) {
    const userCharacter = userCharacters[0];
    const embed = createCharacterEmbed({
      ...userCharacter.character,
      ...userCharacter,
    }).setFooter(`You have x${userCharacter.count} of this character | ${userCharacter.character.slug}`);
    return message.reply('', { embed });
  }

  const embed = new MessageEmbed()
    .setTitle('Search Results')
    .setFooter(`Page: ${page}`)
    .setColor(Constants.Colors.BLUE);

  userCharacters.forEach((userCharacter) => {
    const { character } = userCharacter;
    const { series } = character;
    const description = [
      renderCharacterStars(userCharacter.stars, userCharacter.additionalStars),
      `${formatter.bold('Appears in')}: ${series.map(({ title }) => title).join(', ')}`,
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
    withInMemoryCooldown<SearchCommandContext>(async ({ user }) => ({
      max: 1,
      window: 5,
      userId: user.id,
    })),
  ],
  group: CommandGroupName.GACHA,
};

export default SearchCommand;
