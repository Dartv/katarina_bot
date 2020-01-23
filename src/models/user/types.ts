import { Document, Model, Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { ICharacter } from '../character/types';
import { ICommandContext } from '../../types';

export interface IUserImage {
  ref: string;
  url: string;
}

export interface IUser extends Document {
  discordId: string;
  images: IUserImage[];
  characters: ObjectId[];
  favorites: ObjectId[];
  lastRolledAt?: Date;
  waifu?: ObjectId | ICharacter;
  quote?: string;
  deck: ObjectId | Types.DocumentArray<ICharacter>;
  addImageLink: (image: IUserImage) => Promise<IUser>;
  getCharactersBySeries: (input: string) => Promise<ICharacter[]>;
  getCharactersByStars: (options: { stars?: number; field?: string }) => Promise<any>;
  removeAllImageLinks: () => Promise<IUser>;
  removeImageLink: (image: IUserImage) => Promise<IUser>;
}

export interface IUserModel extends Model<IUser> {
  addImageLink: (context: ICommandContext) => Promise<any>;
  findOneByDiscordId: (discordId: string) => Promise<IUser | null>;
  removeAllImageLinks: (context: ICommandContext) => Promise<any>;
  removeImageLink: (context: ICommandContext) => Promise<any>;
}