import { Message } from 'discord.js';
import { pluck } from 'ramda';

import { ICommand } from '../types';
import { COMMAND_TRIGGERS, DeckLimit } from '../util';
import { injectUser } from './middleware';
import { ErrorResponse } from './responses';
import { Character } from '../models';
import { createCharacterEmbed } from '../models/character/util';
import { ICharacter } from '../models/character/types';

const CHOICE_TIME = 15 * 1000;

const chooseCharacter = async (context: { message: Message } & Partial<any>): Promise<Partial<ICharacter>> => {
  const { user, message: { channel }, dispatch } = context;
  const characters = await Character.random(3, [
    {
      $match: {
        _id: { $in: user.characters },
      },
    },
  ]).then(chars => chars.map((char, i) => ({ ...char, index: i + 1 })));

  const embeds = characters.map((character) => createCharacterEmbed({
    ...character,
    footer: { text: `Type ${character.index} to select this character` },
    thumbnail: { url: character.imageUrl },
    imageUrl: null,
  }));

  await Promise.all(embeds.map(embed => dispatch(embed)));
  const predicate = ({ content }: Message) => /^[1-3]$/.test(content);
  const options = {
    time: CHOICE_TIME,
    maxMatches: 1,
    errors: ['time'],
  };
  const collectedMessages = await channel.awaitMessages(predicate, options);
  const firstCollectedMessage = collectedMessages.first();
  const choice = parseInt(firstCollectedMessage.content, 10);
  return characters.find(({ index }) => index === choice);
};

const handler = async (context): Promise<any> => {
  const { user } = context;
  try {
    if (user.characters.length < DeckLimit.MAX) {
      return ErrorResponse('You don\'t have enough characters', context);
    }

    const deck: Partial<ICharacter>[] = await new Array(DeckLimit.MAX).fill(chooseCharacter).reduce(
      async (prev, next) => [...await prev, await next(context)],
      Promise.resolve([]),
    );

    user.deck = pluck('_id', deck);

    await user.save();

    return null;
  } catch (err) {
    console.error(err);
    return ErrorResponse('Couldn\'t build a deck. Try again!', context);
  }
};

export default (): ICommand => ({
  middleware: [injectUser()],
  handler,
  triggers: COMMAND_TRIGGERS.BUILD_DECK,
  description: 'Build your waifu deck',
});
