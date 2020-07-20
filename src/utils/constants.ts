import { ParameterType as ParameterTypes } from 'diskat';

import { UserSettings } from '../types';

export const Trigger = {
  HELP: ['help'],
  GAY: ['gay'],
  LOVE: ['love'],
  DICE: ['dice'],
  LIAR: ['liar'],
  SUDOKU: ['sudoku'],
  ROLL: ['roll'],
  SEARCH: ['search'],
  SET_BANNER: ['setbanner'],
  BANNER: ['banner'],
  BALANCE: ['balance'],
  FAV: ['fav'],
  SET_WAIFU: ['setwaifu'],
  SET_QUOTE: ['setquote'],
  PROFILE: ['profile'],
  DAILY: ['daily'],
};

export enum CommandGroupName {
  GACHA = 'Gacha',
  FUN = 'Fun',
  UTILITY = 'Utility',
  ADMIN = 'Admin',
}

export enum ModelName {
  USER = 'user',
  USER_CHARACTER = 'userCharacter',
  CHARACTER = 'character',
  SERIES = 'series',
  GUILD = 'guild',
  ACHIEVEMENT = 'achievement',
  MISSION = 'mission',
  BANNER = 'banner',
  USER_ROLL = 'userRoll',
}

export const DefaultUserSettings: UserSettings = {
  displayrollprice: 1,
};

export enum MissionCode {
  DAILY = 'DAILY',
  ROLL_DAILY = 'ROLL_DAILY',
  BATTLE_ROYALE_DAILY = 'BATTLE_ROYALE_DAILY',
  DUEL_DAILY = 'DUEL_DAILY',
  QUIZ_DAILY = 'QUIZ_DAILY',
  VERSUS_DAILY = 'VERSUS_DAILY',
  ALL_COMPLETE_DAILY = 'ALL_COMPLETE_DAILY',
}

export enum AchievementCode {
  SERIES_SET = 'SERIES_SET',
}

export enum BannerType {
  NORMAL = 'normal',
  LOCAL = 'local',
  CURRENT = 'current',
}

export enum UserSettingName {
  DISPLAY_ROLL_PRICE = 'displayrollprice',
}

export enum UserSetting {
  OFF = 0,
  ON = 1,
}

export enum CharacterStar {
  ONE_STAR = 1,
  TWO_STAR,
  THREE_STAR,
  FOUR_STAR,
  FIVE_STAR,
  SIX_STAR,
}

export enum PopularityThreshold {
  TWO_STAR = Infinity,
  THREE_STAR = 10000,
  FOUR_STAR = 3000,
  FIVE_STAR = 300,
}

export enum AwakeningStage {
  FIRST = 3,
  SECOND = 5,
  THIRD = 10,
}

export enum DiscordLimit {
  EMBED_DESCRIPTION = 2048,
}

export enum Emoji {
  STAR_DEFAULT = '⭐️',
  STAR_FULL = '★',
  STAR_EMPTY = '☆',
}

export const PITY_ROLLS = 100;

export enum LocalParameterType {
  DB_USER = 'db user',
}
export const ParameterType: typeof ParameterTypes & typeof LocalParameterType = {
  ...ParameterTypes,
  ...LocalParameterType,
};

export const DAILY_CURRENCY = 500;
