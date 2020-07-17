import { Types, Model, Document } from 'mongoose';
import { MessageEmbed } from 'discord.js';

import type { UserSettingName, UserSetting, BannerType } from '../utils/constants';
import type { UserCharacters } from '../models/User/UserCharacters';
import { CharacterEmbedOptions } from './common';

export type UserSettings = Record<UserSettingName, UserSetting>;

export interface DocumentBase {
  createdAt: Date;
  updatedAt: Date;
}

export interface UserBase extends DocumentBase {
  discordId: string;
  username: string;
  discriminator: string;
  favorites: Types.ObjectId[] | Types.DocumentArray<CharacterDocument>;
  lastRolledAt?: Date;
  waifu?: Types.ObjectId;
  quote?: string;
  currency: number;
  correctQuizGuesses: number;
  settings: UserSettings;
}
export interface UserDocument extends Document, UserBase {
  _id: Types.ObjectId;
  characters: UserCharacters;
}
export type UserModel = Model<UserDocument>;

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
}

export interface SeriesBase extends DocumentBase {
  title: string;
  slug: string;
}
export interface SeriesDocument extends Document, SeriesBase {
  _id: Types.ObjectId;
}
export type SeriesModel = Model<SeriesDocument>;

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

export interface GuildBase extends DocumentBase {
  discordId: string;
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
}
export interface BannerModel extends Model<BannerDocument> {
  fetchLatest: (this: BannerModel) => Promise<BannerDocument>;
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
