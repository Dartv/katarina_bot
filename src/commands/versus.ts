import { expectUser } from 'ghastly/lib/middleware';

import { ICommand } from '../types';
import { COMMAND_TRIGGERS } from '../util';
import Character from '../models/character';
import { createCharacterEmbed } from '../models/character/util';

const middleware = [
  expectUser(process.env.SUPER_ADMIN_ID),
];

const handler = async (context) => {
  const { dispatch, args: { stars } } = context;
  try {
    const characters = await Character.random(2, [
      {
        $match: { stars: Number(stars) },
      },
    ]);
    const messages = await Promise.all(
      characters.map(character => dispatch(createCharacterEmbed(character))),
    );
    await Promise.all(
      messages.map(msg => msg.react('❤️')),
    );
  } catch (err) {
    console.error(err);
  }
};

export default (): ICommand => ({
  middleware,
  handler,
  triggers: COMMAND_TRIGGERS.VERSUS,
  description: 'Waifu versus battle',
  parameters: [
    {
      name: 'stars',
      description: 'stars',
      defaultValue: 5,
      optional: true,
    },
  ],
});
