import { Command } from 'diskat';

import { Trigger, CommandGroupName } from '../../utils/constants';
import { expectOwner } from '../middleware/expectOwner';
import { Banner } from '../../models';
import { createCharacterEmbed, getCharacterStarRating } from '../../utils/character';
import { CharacterDocument, Context } from '../../types';
import { ErrorResponse } from '../responses';
import { isDocument } from '../../utils/mongo-common';

const SetBannerCommand: Command<Context> = async (context): Promise<any> => {
  const { message } = context;
  const banner = await Banner.refresh();

  if (!banner) {
    return new ErrorResponse(context, 'No 5 ⭐️ characters found');
  }

  if (!isDocument(banner.featured)) {
    await banner.populate({
      path: 'featured',
      populate: {
        path: 'series',
      },
    }).execPopulate();
  }

  const character = banner.featured as CharacterDocument;
  const embed = createCharacterEmbed({
    ...character.toObject(),
    stars: getCharacterStarRating(character.popularity),
  });

  return message.reply(`Banner for "${character.name}" set`, { embed });
};

SetBannerCommand.config = {
  triggers: Trigger.SET_BANNER,
  description: 'Set character banner',
  middleware: [
    expectOwner(),
  ],
  group: CommandGroupName.ADMIN,
};

export default SetBannerCommand;
