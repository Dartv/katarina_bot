import { Command } from 'diskat';

import { Trigger, CommandGroupName, PopularityThreshold } from '../../utils/constants';
import { expectOwner } from '../middleware/expectOwner';
import { Banner, Character, UserRoll } from '../../models';
import { createCharacterEmbed } from '../../utils/character';
import { Context } from '../../types';
import { ErrorResponse } from '../responses';

const SetBannerCommand: Command<Context> = async (context): Promise<any> => {
  const { message } = context;
  const [banner, [character]] = await Promise.all([
    Banner.fetchLatest(),
    Character.random(1, [
      {
        $match: {
          popularity: {
            $lte: PopularityThreshold.FIVE_STAR,
          },
        },
      },
    ]),
  ]);

  if (!character) {
    return new ErrorResponse(context, 'No 5 ⭐️ characters found');
  }

  await Promise.all([
    Banner.updateMany(
      {
        endedAt: {
          $exists: false,
        },
      },
      {
        $set: {
          endedAt: new Date(),
        },
      },
    ),
    ...(banner ? [UserRoll.deleteMany({ drop: banner.featured })] : []),
    new Banner({
      featured: character._id,
    }).save(),
  ]);
  const embed = createCharacterEmbed(character.toObject());
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
