import { pluck } from 'ramda';

import { ICommand } from '../types';
import { COMMAND_TRIGGERS } from '../util';
import Character from '../models/character';
import { createCharacterEmbed } from '../models/character/util';
import { withCooldown } from './middleware';
import { ANSWER_TIME, isSimilarEnough } from './whois';

const middleware = [
  withCooldown(ANSWER_TIME),
];

const handler = async (context) => {
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
    const series = pluck('title', character.series as any[]).map(title => title.trim().toLowerCase());
    const predicate = ({ content }): boolean => {
      const guess = content.trim().toLowerCase();

      return series.some(serie => (
        isSimilarEnough(serie, guess)
        || serie.split(' ').some(part => isSimilarEnough(part, guess))
      ));
    };
    const options = {
      time: ANSWER_TIME,
      maxMatches: 1,
      errors: ['time'],
    };
    try {
      const collectedResponse = await channel.awaitMessages(predicate, options)
        .then(messages => messages.first());

      if (collectedResponse) {
        clearCooldown();
        await collectedResponse.reply(
          'Congratulations! Your guess was correct',
          createCharacterEmbed(character),
        );
      }
    } catch (err) {
      await channel.send('No correct answers...', createCharacterEmbed(character));
    }
  } catch (err) {
    clearCooldown();
    console.error(err);
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
