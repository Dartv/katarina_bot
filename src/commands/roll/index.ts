import {
  ICommand,
  ICommandHandler,
  Middleware,
  ICommandContext,
} from 'ghastly';

import {
  COMMAND_TRIGGERS,
  PriceTable,
  MissionCode,
  RewardTable,
  BannerType,
} from '../../util';
import { ICharacter } from '../../models/character/types';
import { injectUser, withPrice, withMission } from '../middleware';
import { rollLocalBanner } from './rollLocalBanner';
import { rollNormalBanner } from './rollNormalBanner';
import { rollCurrentBanner } from './rollCurrentBanner';
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

const roll = async (context: ICommandContext): Promise<ICharacter> => {
  const { args } = context;
  const banner: BannerType = args.banner.trim().toLowerCase();
  switch (banner) {
    case BannerType.LOCAL:
      return rollLocalBanner(context);
    case BannerType.CURRENT:
      return rollCurrentBanner(context);
    default:
      return rollNormalBanner(context);
  }
};

const handler: ICommandHandler = async (context): Promise<void> => {
  const { user } = context;
  const character = await roll(context);

  user.characters.push(character._id);
  user.lastRolledAt = new Date();
  await user.save();
};

export default (): ICommand => ({
  middleware,
  handler,
  parameters: [
    {
      name: 'banner',
      description: `${Object.values(BannerType).join(', ')}`,
      optional: true,
      defaultValue: BannerType.NORMAL,
    },
  ],
  triggers: COMMAND_TRIGGERS.ROLL,
  description: 'Waifu gacha game',
});
