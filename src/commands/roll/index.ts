import { ICommand, ICommandHandler, Middleware } from 'ghastly';

import {
  Banner, COMMAND_TRIGGERS, PriceTable, MissionCode, RewardTable,
} from '../../util';
import { ICharacter } from '../../models/character/types';
import { User } from '../../models';
import { injectUser, withPrice, withMission } from '../middleware';
import { rollLocalBanner } from './rollLocalBanner';
import { rollNormalBanner } from './rollNormalBanner';
import { getDailyResetDate } from '../../util/daily';
import { IMission } from '../../models/mission/types';

const middleware: Middleware[] = [
  injectUser(),
  withPrice(PriceTable.ROLL),
  withMission(async () => ({
    code: MissionCode.ROLL,
    reward: RewardTable.ROLL,
    update: async (mission): Promise<IMission> => {
      Object.assign(mission, {
        progress: mission.progress + 1,
        resetsAt: getDailyResetDate(),
      });

      if (mission.progress >= 3) {
        Object.assign(mission, {
          completedAt: new Date(),
        });
      }

      return mission;
    },
  })),
];

const handler: ICommandHandler = async (context): Promise<void> => {
  const { args } = context;
  const banner: Banner = args.banner.trim().toLowerCase();
  let character: ICharacter;

  if (banner === Banner.LOCAL) {
    character = await rollLocalBanner(context);
  } else {
    character = await rollNormalBanner(context);
  }

  await User.findByIdAndUpdate(context.user.id, {
    $push: {
      characters: character._id,
    },
    $set: {
      lastRolledAt: new Date(),
    },
  });
};

export default (): ICommand => ({
  middleware,
  handler,
  parameters: [
    {
      name: 'banner',
      description: 'banner to roll on',
      optional: true,
      defaultValue: Banner.NORMAL,
    },
  ],
  triggers: COMMAND_TRIGGERS.ROLL,
  description: 'Waifu gacha game. Available banners are Normal (default) and Local (has unique characters)',
});
