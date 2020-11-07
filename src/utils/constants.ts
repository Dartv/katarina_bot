import { ParameterType as ParameterTypes } from 'diskat';

import { UserSettings, MissionDescriptor } from '../types';

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
  DUEL: ['duel'],
  ATTACK: ['attack'],
  ENTER: ['enter'],
  MISSIONS: ['missions'],
  QUIZ: ['quiz'],
  VERSUS: ['versus'],
  SETTINGS: ['settings'],
  GIFT: ['gift'],
  ADD_PLAYER: ['addplayer'],
  GUILD_SETTINGS: ['guildsettings'],
};

export enum CommandGroupName {
  GACHA = 'Gacha',
  GAMES = 'Games',
  FUN = 'Fun',
  UTILITY = 'Utility',
  ADMIN = 'Admin',
  GUILD = 'Guild',
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
  BOSS = 'boss',
  BOSS_PARTICIPANT = 'bossParticipant',
  BATTLE = 'battle',
  BATTLE_PARTICIPANT = 'battleParticipant',
  BENCH = 'bench',
}

export const DefaultUserSettings: UserSettings = {
  displayrollprice: 1,
};

export enum MissionCode {
  CURRENCY_DAILY = 'CURRENCY_DAILY',
  ROLL_DAILY = 'ROLL_DAILY',
  BATTLE_ROYALE_DAILY = 'BATTLE_ROYALE_DAILY',
  DUEL_DAILY = 'DUEL_DAILY',
  QUIZ_DAILY = 'QUIZ_DAILY',
  VERSUS_DAILY = 'VERSUS_DAILY',
  ALL_COMPLETE_DAILY = 'ALL_COMPLETE_DAILY',
}

export const Missions: { [key in MissionCode]: MissionDescriptor } = {
  [MissionCode.CURRENCY_DAILY]: {
    description: 'acquire daily coins',
    reward: 25,
  },
  [MissionCode.ROLL_DAILY]: {
    description: 'roll 3 characters',
    reward: 100,
  },
  [MissionCode.BATTLE_ROYALE_DAILY]: {
    description: 'participate in a waifu royale',
    reward: 100,
  },
  [MissionCode.DUEL_DAILY]: {
    description: 'fight in a duel',
    reward: 50,
  },
  [MissionCode.QUIZ_DAILY]: {
    description: 'guess a character',
    reward: 50,
  },
  [MissionCode.VERSUS_DAILY]: {
    description: 'vote in Waifu Wars',
    reward: 50,
  },
  [MissionCode.ALL_COMPLETE_DAILY]: {
    description: 'complete all missions',
    reward: 150,
  },
};

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
  COOL_CHAMP = '<:CoolChamp:685274406829817945>',
}

export const PITY_ROLLS = 100;

export enum LocalParameterType {
  DB_USER = 'db user',
  DB_MEMBER = 'db member',
}
export const ParameterType: typeof ParameterTypes & typeof LocalParameterType = {
  ...ParameterTypes,
  ...LocalParameterType,
};

export const DAILY_CURRENCY = 500;

export const DamageByStar: Record<CharacterStar, number> = {
  [CharacterStar.ONE_STAR]: 0,
  [CharacterStar.TWO_STAR]: 2,
  [CharacterStar.THREE_STAR]: 5,
  [CharacterStar.FOUR_STAR]: 15,
  [CharacterStar.FIVE_STAR]: 45,
  [CharacterStar.SIX_STAR]: 135,
};

export const WORLD_BOSS_SCALE_FACTOR = 35;

export enum BattleStatus {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum BattleType {
  ROYALE = 'ROYALE',
}

export const BATTLE_ROYALE_QUEUE_TIME_IN_MINUTES = 10;

export enum MissionType {
  REGULAR = 'REGULAR',
}

export enum PriceTable {
  ROLL_NORMAL = 100,
  ROLL_LOCAL = 120,
  SET_WAIFU = 100,
  SET_QUOTE = 100,
}

export const TEST_GUILD_IDS = ['557804417550909440', '362966121319759882'];

export enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export enum GuildSetting {
  BOSS_CHANNEL = 'bossChannel',
  WARS_CHANNEL = 'warsChannel',
  ROYALE_CHANNEL = 'royaleChannel',
}

export const MWL_BASE_URL = 'https://mywaifulist.moe';
