import { expectUser } from 'ghastly/lib/middleware';
import { compareTwoStrings } from 'string-similarity';

import { ICommand } from '../types';
import { COMMAND_TRIGGERS } from '../util';
import Character from '../models/character';
import { createCharacterEmbed } from '../models/character/util';
import { withCooldown } from './middleware';

const ANSWER_TIME = 15 * 1000;
const SIMILARITY_THRESHOLD = 0.8;

const isSimilarEnough = (a: string, b: string): boolean => compareTwoStrings(a, b) > SIMILARITY_THRESHOLD;

const middleware = [
  expectUser(process.env.SUPER_ADMIN_ID),
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
      name: '???',
    });
    await dispatch(embed);
    const predicate = ({ content }): boolean => {
      const name = character.name.trim().toLowerCase();
      const guess = content.trim().toLowerCase();

      return isSimilarEnough(name, guess) || name.split(' ').some(part => isSimilarEnough(part, guess));
    };
    const options = {
      time: ANSWER_TIME,
      maxMatches: 1,
      errors: ['time'],
    };
    try {
      const collectedResponse = await channel.awaitMessages(predicate, options).then(messages => messages.first());

      if (collectedResponse) {
        clearCooldown();
        await collectedResponse.reply(`Congratulations! The name was "${character.name}"`);
      }
    } catch (err) {
      await dispatch(`No correct answers... The name was "${character.name}"`);
    }
  } catch (err) {
    clearCooldown();
    console.error(err);
  }
};

export default (): ICommand => ({
  middleware,
  handler,
  triggers: COMMAND_TRIGGERS.WHOIS,
  description: 'Waifu guessing game',
  parameters: [
    {
      name: 'stars',
      description: 'stars',
      optional: true,
    },
  ],
});
