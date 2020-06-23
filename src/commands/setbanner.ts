import { ICommand, ICommandHandler } from 'ghastly';

import { expectUser } from 'ghastly/lib/middleware';
import { COMMAND_TRIGGERS, CharacterStar } from '../util';
import { Banner, Character, User } from '../models';
import { ErrorResponse } from './responses/ErrorResponse';
import { injectUser } from './middleware';
import { createCharacterEmbed } from '../models/character/util';
import { ICharacter } from '../models/character/types';

const getCharacterBySlug = async (slug: string): Promise<ICharacter> => {
  if (slug === 'random') {
    const [character] = await Character.random(1, [
      {
        $match: {
          stars: CharacterStar.FIVE_STAR,
        },
      },
    ]);

    return character;
  }

  return Character.findOne({ slug }).populate('series');
};

const handler: ICommandHandler = async (context): Promise<any> => {
  const { user, message, args: { slug } } = context;
  const character = await getCharacterBySlug(slug);

  if (!character) {
    return new ErrorResponse(`character ${slug} doesn't exist`, context);
  }

  await Promise.all([
    Banner.updateMany(
      {
        endedAt: { $exists: false },
      },
      {
        $set: {
          endedAt: new Date(),
        },
      },
    ),
    User.updateMany({}, {
      $set: {
        rolls: 0,
      },
    }),
  ]);

  await new Banner({
    character: character._id,
    createdBy: user._id,
  }).save();

  await message.channel.send(`Banner for ${character.name} set`, {
    embed: createCharacterEmbed(character),
  });

  return null;
};

export default (): ICommand => ({
  handler,
  middleware: [
    expectUser(process.env.SUPER_ADMIN_ID),
    injectUser(),
  ],
  parameters: [
    {
      name: 'slug',
      description: 'character slug',
    },
  ],
  triggers: COMMAND_TRIGGERS.SET_BANNER,
  description: 'Sets current event banner (only for super admin)',
});
