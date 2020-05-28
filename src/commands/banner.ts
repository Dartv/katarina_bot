import { ICommand, ICommandHandler } from 'ghastly';
import { formatDistanceStrict, addWeeks } from 'date-fns';

import { COMMAND_TRIGGERS, ROLLS_TO_PITY } from '../util';
import { injectUser } from './middleware';
import { createCharacterEmbed } from '../models/character/util';
import { Banner, Character } from '../models';

const handler: ICommandHandler = async (context): Promise<any> => {
  const { user, message } = context;
  const banner = await Banner
    .findOne({ endedAt: { $exists: false } })
    .sort({ createdAt: -1 })
    .populate({
      path: 'character',
      populate: {
        path: 'series',
      },
    });

  if (banner?.character instanceof Character) {
    const { character } = banner;
    const distance = formatDistanceStrict(new Date(), addWeeks(banner.createdAt, 2));
    await message.channel.send(
      `${ROLLS_TO_PITY - user.rolls} rolls until guaranteed summon\n${distance} left until next banner`,
      {
        embed: createCharacterEmbed(character),
      },
    );
  }
};

export default (): ICommand => ({
  handler,
  middleware: [injectUser()],
  triggers: COMMAND_TRIGGERS.BANNER,
  description: 'Shows current banner',
});
