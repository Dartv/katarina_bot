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
} from '../../types';
import { injectUser } from '../middleware';
import { renderCharacterStars, createCharacterEmbed } from '../../utils/character';

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
  ],
  group: CommandGroupName.GACHA,
};

export default SearchCommand;