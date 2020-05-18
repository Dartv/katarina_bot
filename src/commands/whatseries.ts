import { pluck } from 'ramda';
import { ICommand, ICommandHandler } from 'ghastly';

import { COMMAND_TRIGGERS } from '../util';
import Character from '../models/character';
import { createCharacterEmbed } from '../models/character/util';
import { withCooldown } from './middleware';
import { ANSWER_TIME, isSimilarEnough } from './whois';

const BANNED = ['the', 'in', 'at', 'a', 'of', '&', 'to', 'no'];

const middleware = [
  withCooldown(ANSWER_TIME),
];

export const handler: ICommandHandler = async (context) => {
  const {
    dispatch,
    message: { channel },
    args: { stars },
    clearCooldown,
  } = context;
  try {
    const [character] = await Character.random(1, [
      {
        $match: {
          ...(Number.isInteger(Number(stars)) && { stars: Number(stars) }),
        },
      },
    ]);
    const embed = createCharacterEmbed({
      ...character,
      series: [],
    });
    await dispatch(embed);
    const series = pluck('title', character.series).map(title => title.trim().toLowerCase());
    try {
      const collectedResponse = await channel.awaitMessages(
        ({ content }): boolean => {
          const guess = content.trim().toLowerCase();

          if (BANNED.includes(guess)) return false;

          return series.some(serie => (
            isSimilarEnough(serie, guess)
            || serie.split(' ').some(part => isSimilarEnough(part, guess))
          ));
        },
        {
          time: ANSWER_TIME,
          maxMatches: 1,
          errors: ['time'],
        },
      ).then(messages => messages.first());

      if (collectedResponse) {
        clearCooldown();
        return collectedResponse.reply(
          'Congratulations! Your guess was correct',
          {
            embed: createCharacterEmbed(character),
          },
        );
      }

      return null;
    } catch (err) {
      return channel.send('No correct answers...', createCharacterEmbed(character));
    }
  } catch (err) {
    clearCooldown();
    console.error(err);
    return null;
  }
};

export default (): ICommand => ({
  middleware,
  handler,
  triggers: COMMAND_TRIGGERS.WHATSERIES,
  description: 'Series guessing game',
  parameters: [
    {
      name: 'stars',
      description: 'stars',
      optional: true,
    },
  ],
});
