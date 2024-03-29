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
  TRACK_VRCHAT_CREATOR: ['trackvrchatcreator'],
};

export enum CommandGroupName {
  GACHA = 'Gacha',
  GAMES = 'Games',
  FUN = 'Fun',
  UTILITY = 'Utility',
  ADMIN = 'Admin',
  GUILD = 'Guild',
  VRCHAT = 'VRChat'
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
  WORLD_BOSS_DAILY = 'WORLD_BOSS_DAILY',
  ALL_COMPLETE_DAILY = 'ALL_COMPLETE_DAILY',
  DEFEAT_WORLD_BOSS_WEEKLY = 'DEFEAT_WORLD_BOSS_WEEKLY',
  ALL_COMPLETE_WEEKLY = 'ALL_COMPLETE_WEEKLY',
}

export enum MissionType {
  REGULAR = 'REGULAR',
}

export enum MissionFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
}

export const Missions: { [key in MissionCode]: MissionDescriptor } = {
  [MissionCode.CURRENCY_DAILY]: {
    description: 'acquire daily coins',
    reward: 10,
    frequency: MissionFrequency.DAILY,
  },
  [MissionCode.ROLL_DAILY]: {
    description: 'roll a character',
    reward: 30,
    frequency: MissionFrequency.DAILY,
  },
  [MissionCode.BATTLE_ROYALE_DAILY]: {
    description: 'participate in a waifu royale',
    reward: 30,
    frequency: MissionFrequency.DAILY,
  },
  [MissionCode.DUEL_DAILY]: {
    description: 'fight in a duel',
    reward: 15,
    frequency: MissionFrequency.DAILY,
  },
  [MissionCode.QUIZ_DAILY]: {
    description: 'guess a character',
    reward: 15,
    frequency: MissionFrequency.DAILY,
  },
  [MissionCode.VERSUS_DAILY]: {
    description: 'vote in Waifu Wars',
    reward: 15,
    frequency: MissionFrequency.DAILY,
  },
  [MissionCode.WORLD_BOSS_DAILY]: {
    description: 'attack World Boss',
    reward: 15,
    frequency: MissionFrequency.DAILY,
  },
  [MissionCode.ALL_COMPLETE_DAILY]: {
    description: 'complete all missions',
    reward: 100,
    frequency: MissionFrequency.DAILY,
  },
  [MissionCode.ALL_COMPLETE_WEEKLY]: {
    description: 'complete all missions every day for a week',
    reward: 300,
    frequency: MissionFrequency.WEEKLY,
  },
  [MissionCode.DEFEAT_WORLD_BOSS_WEEKLY]: {
    description: 'defeat World Boss',
    reward: 50,
    frequency: MissionFrequency.WEEKLY,
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

export const DAILY_CURRENCY = 150;
export const QUIZ_GUESS_CURRENCY = 10;
export const BATTLE_ROYALE_WIN_CURRENCY = 100;

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

export enum PriceTable {
  ROLL_NORMAL = 100,
  ROLL_LOCAL = 100,
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
  VRC_WORLDS_CHANNEL = 'vrcWorldsChannel',
}

export const MWL_BASE_URL = 'https://mywaifulist.moe';

export const DAYS_IN_WEEK = 7;

export enum ActionThreshold {
  ATTACK_WORLD_BOSS = 10,
  PARTICIPATE_IN_DUEL = 10,
  PARTICIPATE_IN_ROYALE = 10,
}
