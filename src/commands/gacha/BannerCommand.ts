import { Command } from 'diskat';
import { formatDistanceStrict, addWeeks } from 'date-fns';

import { Trigger, PITY_ROLLS } from '../../utils/constants';
import { injectUser } from '../middleware';
import { Banner, UserRoll } from '../../models';
import { createCharacterEmbed } from '../../utils/character';
import { Context, UserDocument, CharacterDocument } from '../../types';
import { ErrorResponse } from '../responses';

export interface BannerCommandContext extends Context {
  user: UserDocument;
}

const BannerCommand: Command<BannerCommandContext> = async (context): Promise<any> => {
  const { user, message } = context;
  const banner = await Banner.fetchLatest();

  if (!banner) {
    return new ErrorResponse(context, 'There is no banner currently...');
  }

  const rolls = await UserRoll.countDocuments({
    user: user._id,
    banner: banner._id,
  });
  const distance = formatDistanceStrict(new Date(), addWeeks(banner.createdAt, 2));
  const character = banner.featured as CharacterDocument;
  return message.channel.send(
    `${PITY_ROLLS - rolls} rolls until guaranteed summon\n${distance} left until next banner`,
    {
      embed: createCharacterEmbed(character.toObject()),
    },
  );
};

BannerCommand.config = {
  triggers: Trigger.BANNER,
  middleware: [injectUser()],
  description: 'Show current event banner',
};

export default BannerCommand;
