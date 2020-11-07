import { logger } from '../../services/logger';
import { BannerModel } from '../../types';
import { PopularityThreshold } from '../../utils/constants';
import { Character } from '../Character';
import { UserRoll } from '../UserRoll';

export const fetchLatest: BannerModel['fetchLatest'] = async function () {
  return this
    .findOne({
      endedAt: { $exists: false },
    })
    .sort({ createdAt: -1 })
    .populate({
      path: 'featured',
      populate: {
        path: 'series',
      },
    });
};

export const refresh: BannerModel['refresh'] = async function () {
  logger.log('Refreshing banner...');

  const [banner, [character]] = await Promise.all([
    this.fetchLatest(),
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
    return null;
  }

  await Promise.all([
    this.updateMany(
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
  ]);

  const newBanner = await new this({
    featured: character._id,
  }).save();

  logger.log(`Banner refreshed. New character is ${character.id}`);

  return newBanner;
};
