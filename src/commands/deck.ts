import { ICommand, ICommandHandler } from 'ghastly';

import { COMMAND_TRIGGERS } from '../util';
import { injectUser } from './middleware';
import { ErrorResponse } from './responses';
import { createCharacterEmbed } from '../models/character/util';

const handler: ICommandHandler = async (context): Promise<any> => {
  const { user, message } = context;

  if (!user.deck.length) {
    return ErrorResponse(
      `You have no deck. Build your deck using ${process.env.BOT_PREFIX}${COMMAND_TRIGGERS.BUILD_DECK}`,
      context,
    );
  }

  const embeds = user.deck.map(character => createCharacterEmbed({
    ...character.toObject(),
    imageUrl: null,
    thumbnail: { url: character.imageUrl },
  }));

  await message.author.sendMessage('Here\'s your deck');
  await Promise.all(embeds.map(embed => message.author.sendEmbed(embed)));

  return null;
};

export default (): ICommand => ({
  middleware: [injectUser()],
  handler,
  triggers: COMMAND_TRIGGERS.DECK,
  description: 'View your deck',
});
