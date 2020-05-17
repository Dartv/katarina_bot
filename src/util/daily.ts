import {
  set, startOfToday, isAfter, startOfTomorrow, formatDistanceToNow, differenceInSeconds,
} from 'date-fns';

export const getDailyResetDate = (): Date => {
  const date = set(startOfToday(), { hours: 6 });
  return isAfter(new Date(), date) ? set(startOfTomorrow(), { hours: 6 }) : date;
};

export const getTimeInSecondsUntilDailyReset = (): number => differenceInSeconds(
  getDailyResetDate(),
  new Date(),
);

export const formatTimeUntilDailyReset = formatDistanceToNow(getDailyResetDate());
