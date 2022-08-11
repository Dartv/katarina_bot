import { Types, Model, Document } from 'mongoose';
import {
  MessageEmbed,
  GuildMember,
  Guild,
  User,
} from 'discord.js';

import type {
  UserSettingName,
  UserSetting,
  BannerType,
  BattleStatus,
  BattleType,
  MissionType,
  GuildSetting,
  MissionFrequency,
} from '../utils/constants';
import type { UserCharacters } from '../models/User/UserCharacters';
import { CharacterEmbedOptions } from './common';

export type UserSettings = Record<UserSettingName, UserSetting>;

export interface DocumentBase {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserScoresaberService {
  playerId: string;
}
export interface UserServices {
  scoresaber?: UserScoresaberService;
}
export interface UserBase extends DocumentBase {
  discordId: string;
  username: string;
  discriminator: string;
  favorites: Types.ObjectId[] | CharacterDocument[];
  lastRolledAt?: Date;
  waifu?: Types.ObjectId | CharacterDocument;
  quote?: string;
  currency: number;
  correctQuizGuesses: number;
  settings: UserSettings;
  services: UserServices;
}
export interface UserDocument extends Document, UserBase {
  _id: Types.ObjectId;
  characters: UserCharacters;
  favorites: Types.Array<Types.ObjectId> | Types.DocumentArray<CharacterDocument>;
  searchCharacters: (this: UserDocument, options: UserSearchCharactersOptions) => Promise<Array<
    & UserCharacterBase
    & Pick<UserCharacterDocument, 'stars' | 'baseStars' | 'additionalStars'>
    & { character: CharacterBase & { series: SeriesBase[] } }
  >>;
  addFav: (this: UserDocument, name: string) => Promise<CharacterDocument>;
  delFav: (this: UserDocument, name: string) => Promise<CharacterDocument>;
}
export interface UserModel extends Model<UserDocument> {
  register: (this: UserModel, user: User) => Promise<UserDocument>;
}
export interface UserSearchCharactersOptions {
  name?: string;
  series?: string;
  stars?: number;
  limit?: number;
  skip?: number;
  ids?: Types.ObjectId[];
}

export interface UserCharacterBase extends DocumentBase {
  character: Types.ObjectId | CharacterDocument;
  user: Types.ObjectId | UserDocument;
  count: number;
}
export interface UserCharacterDocument extends Document, UserCharacterBase {
  _id: Types.ObjectId;
  stars: number;
  additionalStars: number;
  baseStars: number;
  createEmbed: (this: UserCharacterDocument, options?: CharacterEmbedOptions) => MessageEmbed;
}
export type UserCharacterModel = Model<UserCharacterDocument>;
export interface UserCharacterPopulated extends UserCharacterDocument {
  character: CharacterDocument & {
    series: Types.DocumentArray<SeriesDocument>;
  };
}

export interface CharacterBase extends DocumentBase {
  name: string;
  description?: string;
  popularity: number;
  slug: string;
  imageUrl: string;
  series: Types.ObjectId[] | Types.DocumentArray<SeriesDocument>;
}
export interface CharacterDocument extends Document, CharacterBase {
  _id: Types.ObjectId;
}
export interface CharacterModel extends Model<CharacterDocument> {
  random(this: CharacterModel, n: number, pipeline?: Record<string, unknown>[]): Promise<CharacterDocument[]>;
  search: <T = CharacterBase>(this: CharacterModel, options: CharacterSearchOptions) => Promise<T[]>;
}
export interface CharacterSearchOptions {
  searchTerm: string;
  match?: { [key in keyof CharacterBase]?: unknown };
  series?: Types.ObjectId[];
  skip?: number;
  limit?: number;
  populate?: boolean;
  project?: { [key in keyof CharacterBase]?: unknown };
}

export interface SeriesBase extends DocumentBase {
  title: string;
  slug: string;
}
export interface SeriesDocument extends Document, SeriesBase {
  _id: Types.ObjectId;
}
export interface SeriesModel extends Model<SeriesDocument> {
  search: <T = SeriesBase>(this: SeriesModel, options: SeriesSearchOptions) => Promise<T[]>;
}
export interface SeriesSearchOptions {
  searchTerm: string;
  skip?: number;
  limit?: number;
  project?: { [key in keyof SeriesBase]?: unknown };
}

export interface AchievementBase extends DocumentBase {
  user: Types.ObjectId | UserDocument;
  completedAt: Date;
  code: string;
  progress: number;
  meta: Record<string, unknown>;
}
export interface AchievementDocument extends Document, AchievementBase {
  _id: Types.ObjectId;
}
export type AchievementModel = Model<AchievementDocument>;

export interface GuildScoresaberService {
  playerIds: string[];
}

export interface GuildVRChatService {
  trackedCreatorIds: string[];
}
export interface GuildServices {
  scoresaber?: GuildScoresaberService;
  vrchat?: GuildVRChatService;
}
export type GuildSettings = Record<GuildSetting, string | null>;
export interface GuildBase extends DocumentBase {
  discordId: string;
  services: GuildServices;
  settings: GuildSettings;
}
export interface GuildDocument extends Document, GuildBase {
  _id: Types.ObjectId;
}
export type GuildModel = Model<GuildDocument>;

export interface MissionBase extends DocumentBase {
  user: Types.ObjectId | UserDocument;
  completedAt: Date;
  resetsAt: Date;
  progress: number;
  code: string;
  meta: Record<string, unknown>;
  type: MissionType;
  frequency: MissionFrequency;
}
export interface MissionDocument extends Document, MissionBase {
  _id: Types.ObjectId;
}
export type MissionModel = Model<MissionDocument>;

export interface BannerBase extends DocumentBase {
  featured: CharacterDocument | Types.ObjectId;
  endedAt: Date;
}
export interface BannerDocument extends Document, BannerBase {
  _id: Types.ObjectId;
  isExpired: (this: BannerDocument) => boolean;
}
export interface BannerModel extends Model<BannerDocument> {
  fetchLatest: (this: BannerModel) => Promise<BannerDocument>;
  refresh: (this: BannerModel) => Promise<BannerDocument>;
}

export interface UserRollBase extends DocumentBase {
  drop: CharacterDocument | Types.ObjectId;
  user: UserDocument | Types.ObjectId;
  banner: BannerDocument | Types.ObjectId | BannerType;
}
export interface UserRollDocument extends Document, UserRollBase {
  _id: Types.ObjectId;
}
export type UserRollModel = Model<UserRollDocument>;

export interface BossWinner {
  participant: BossParticipantDocument;
  user: UserDocument;
  member: GuildMember;
  reward: number;
}
export interface BossStats {
  hp?: number;
  maxHp?: number;
}
export interface BossBase extends DocumentBase {
  character: Types.ObjectId | CharacterDocument;
  guild: Types.ObjectId | GuildDocument;
  endedAt?: Date;
  isDefeated?: boolean;
  defeatedAt?: Date;
  stats: BossStats;
}
export interface BossDocument extends Document, BossBase {
  _id: Types.ObjectId;
  injure: (this: BossDocument, damage: number, user: UserDocument) => Promise<BossDocument>;
  getEmbed: (this: BossDocument) => MessageEmbed;
  getStatisticsEmbed: (this: BossDocument, guild: Guild) => Promise<MessageEmbed>;
  getWinners: (this: BossDocument, guild: Guild) => Promise<BossWinner[]>;
}
export interface BossModel extends Model<BossDocument> {
  spawn: (this: BossModel, guild: Types.ObjectId) => Promise<BossDocument>;
  reward: (this: BossModel, place: number) => number;
}

export interface BossParticipantBase {
  user: Types.ObjectId | UserDocument;
  boss: Types.ObjectId | BossDocument;
  damage: number;
  lastAttackedAt: Date;
}
export interface BossParticipantDocument extends Document, BossParticipantBase {
  _id: Types.ObjectId;
}
export type BossParticipantModel = Model<BossParticipantDocument>;

export interface BattleBase extends DocumentBase {
  guild: Types.ObjectId | GuildDocument;
  status: BattleStatus;
  type: BattleType;
}
export interface BattleDocument extends Document, BattleBase {
  _id: Types.ObjectId;
}
export type BattleModel = Model<BattleDocument>;

export interface BattleParticipantBase extends DocumentBase {
  battle: Types.ObjectId | BattleDocument;
  user: Types.ObjectId | UserDocument;
  characters: Types.Array<Types.ObjectId> | Types.DocumentArray<UserCharacterDocument>;
  isDefeated: boolean;
}
export interface BattleParticipantDocument extends Document, BattleParticipantBase {
  _id: Types.ObjectId;
}
export type BattleParticipantModel = Model<BattleParticipantDocument>;

export interface BenchBase extends DocumentBase {
  slug: string;
}
export interface BenchDocument extends Document, BenchBase {
  _id: Types.ObjectId;
}
export type BenchModel = Model<BenchDocument>;
