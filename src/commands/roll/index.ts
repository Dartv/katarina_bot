import {
  ICommand,
  ICommandHandler,
  Middleware,
  ICommandContext,
} from 'ghastly';
import R from 'ramda';
import { Types } from 'mongoose';

import {
  COMMAND_TRIGGERS,
  PriceTable,
  MissionCode,
  RewardTable,
  BannerType,
  AchievementCode,
} from '../../util';
import { ICharacter } from '../../models/character/types';
import { injectUser, withPrice, withMission } from '../middleware';
import { rollLocalBanner } from './rollLocalBanner';
import { rollNormalBanner } from './rollNormalBanner';
import { rollCurrentBanner } from './rollCurrentBanner';
import { getDailyResetDate } from '../../util/daily';
import { IMission } from '../../models/mission/types';
import { createCharacterEmbed } from '../../models/character/util';
import { Achievement, Character } from '../../models';
import { logger } from '../../util/logger';

const calculateReward = (n: number): number => Math.ceil(
  Number.MAX_SAFE_INTEGER / (1 + 200000000000000 * Math.exp(-0.05 * n)) / 10
) * 10;

const withFullSeriesAchievement = (): Middleware => async (next, context) => {
  const res = await next(context);

  const achievementHandler = async (): Promise<void> => {
    const { user } = context;
    const lastCharacterId = R.last(user.characters);
    const character = await Character.findOne({ _id: lastCharacterId });
    const characters = await Character.find({
      series: {
        $in: character.series,
      },
    }).select('_id series');
    const hasCompletedSeries = characters.every(({ _id }) => user.characters.includes(_id));

    if (hasCompletedSeries) {
      const uniqueSeriesIds: Types.ObjectId[] = [...character.series].reduce((acc, seriesId) => {
        if (acc.some((id) => id.equals(seriesId))) {
          return acc;
        }

        return acc.concat(seriesId);
      }, []);

      const promises: Promise<void>[] = uniqueSeriesIds.map(async (seriesId) => {
        let achievement = await Achievement.findOne({
          code: AchievementCode.SERIES_SET,
          user: user._id,
          'meta.series': seriesId,
        });

        if (!achievement) {
          achievement = await new Achievement({
            code: AchievementCode.SERIES_SET,
            user: user._id,
            completedAt: new Date(),
            meta: {
              series: seriesId,
            },
          }).save();
          const charactersInSeries = characters.filter(({ series }) => series.includes(seriesId as any));
          const reward = calculateReward(charactersInSeries.length);
          await user.reward(reward, 'Achievement completed', context);
        }
      });

      await Promise.all(promises);
    }
  };

  achievementHandler().catch(logger.error);

  return res;
};

const middleware: Middleware[] = [
  injectUser(),
  withPrice(PriceTable.ROLL),
  withFullSeriesAchievement(),
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
  const { user, message } = context;
  let character: ICharacter;

  try {
    character = await roll(context);
  } catch (err) {
    user.currency += PriceTable.ROLL;
    await user.save();

    throw err;
  }

  character.awaken(user);

  await message.reply(createCharacterEmbed(character.toObject()));

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
      description: `${Object.values(BannerType).join('/')}`,
      optional: true,
      defaultValue: BannerType.NORMAL,
    },
  ],
  triggers: COMMAND_TRIGGERS.ROLL,
  description: 'Waifu gacha game',
});
