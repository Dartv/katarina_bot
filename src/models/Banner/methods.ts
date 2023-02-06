import {
  isAfter,
  isEqual,
  startOfDay,
  subWeeks,
} from 'date-fns';

import { BannerDocument } from '../../types';

export const isExpired: BannerDocument['isExpired'] = function () {
  const twoWeeksAgo = subWeeks(startOfDay(new Date()), 1);
  const createdAt = startOfDay(this.createdAt);
  return !!this.endedAt || isEqual(twoWeeksAgo, createdAt) || isAfter(twoWeeksAgo, this.createdAt);
};
