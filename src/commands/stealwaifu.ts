import { Message } from 'discord.js';
import random from 'random-int';
import { times } from 'ramda';
import { ObjectId } from 'mongodb';

import { ICommand } from '../types';
import { COMMAND_TRIGGERS, Emoji, CharacterStar } from '../util';
import { injectUser } from './middleware';
import { Character, User } from '../models';
import { ErrorResponse } from './responses';
import { ICharacter } from '../models/character/types';
import { createCharacterEmbed } from '../models/character/util';

const ROUND_TRIPS = 3;

const removeRandomCharacter = (
  { characters, favorites }: { characters: ObjectId[]; favorites: ObjectId[] },
): ObjectId => {
  const id = characters.splice(random(characters.length), 1)[0];
  const favIdx = favorites.indexOf(id);

  if (favIdx !== -1) {
    favorites.splice(favIdx, 1);
  }

  return id;
};

const getStolenCharacters = async (...ids: ObjectId[]): Promise<ICharacter[]> => {
  const query = {
    _id: { $in: ids },
  };
  const characters = await Character.find(query).populate('series');
  return [
    characters.find(({ _id }) => _id.equals(ids[0])),
    ...characters.filter(({ _id }) => !_id.equals(ids[0])),
  ];
};

const handler = async (context) => {
  try {
    const { user, message }: { message: Message } & Partial<any> = context;

    const mentionedMember = message.mentions.members.first();

    if (!mentionedMember) return null;

    if (user.characters.length < ROUND_TRIPS) {
      return ErrorResponse('You don\'t have enough waifus', context);
    }

    const [mentionedUser, fiveStarChar]: any = await Promise.all([
      User.findOne({ discordId: mentionedMember.id }),
      Character.findOne({ _id: { $in: user.characters }, stars: CharacterStar.FIVE_STAR }),
    ]);

    if (!mentionedUser) {
      return ErrorResponse(`${mentionedMember.displayName} doesn't have a local profile`, context);
    }

    if (!mentionedUser.characters.length) {
      return ErrorResponse(`${mentionedMember.displayName} doesn't have enough waifus`, context);
    }

    if (!fiveStarChar) {
      return ErrorResponse('You should have at least one five star character', context);
    }

    const theirCharId = removeRandomCharacter(mentionedUser);
    const myCharIds = times(() => removeRandomCharacter(user), ROUND_TRIPS);

    user.characters.push(theirCharId);

    await Promise.all([
      user.save(),
      mentionedUser.save(),
    ]);

    const [
      stolenCharacter,
      ...lostCharacters
    ] = await getStolenCharacters(theirCharId, ...myCharIds);
    const lostText = lostCharacters.map(({ name, stars }) => `${name} ${Emoji.STAR.repeat(stars)}`).join(', ');

    await message.reply(
      `You've stolen ${stolenCharacter.name} from ${mentionedMember.displayName}, but lost ${lostText}`,
      {
        embed: createCharacterEmbed(stolenCharacter),
      },
    );

    return null;
  } catch (err) {
    console.error(err);
    return ErrorResponse('Couldn\'t steal waifu', context);
  }
};

export default (): ICommand => ({
  middleware: [injectUser()],
  handler,
  triggers: COMMAND_TRIGGERS.STEAL_WAIFU,
  description: 'Takes away 3 of your random waifus and steals user\'s random one',
});
