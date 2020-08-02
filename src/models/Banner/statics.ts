import { BannerModel } from '../../types';

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
