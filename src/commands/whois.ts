import { expectUser } from 'ghastly/lib/middleware';

import { ICommand } from '../types';
import { COMMAND_TRIGGERS } from '../util';
import Character from '../models/character';
import { createCharacterEmbed } from '../models/character/util';
import { withCooldown } from './middleware';

const ANSWER_TIME = 15 * 1000;

const middleware = [
  expectUser(process.env.SUPER_ADMIN_ID),
  withCooldown(ANSWER_TIME),
];

const handler = async (context) => {
  const { dispatch, message: { channel } } = context;
  try {
    const [character] = await Character.random(1);
    const embed = createCharacterEmbed({
      ...character,
      name: '???',
    });
    await dispatch(embed);
    const predicate = ({ content }): boolean => content.trim() === character.name;
    const options = {
      time: ANSWER_TIME,
      maxMatches: 1,
      errors: ['time'],
    };
    try {
      const collectedResponse = await channel.awaitMessages(predicate, options).then(messages => messages.first());

      if (collectedResponse) {
        await collectedResponse.reply(`Congratulations! The name was "${character.name}"`);
      }
    } catch (err) {
      console.error(err);
      await dispatch(`No correct answers... The name was "${character.name}"`);
    }
  } catch (err) {
    console.error(err);
  }
};

export default (): ICommand => ({
  middleware,
  handler,
  triggers: COMMAND_TRIGGERS.WHOIS,
  description: 'Waifu guessing game',
});
