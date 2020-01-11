import { Document, Model } from 'mongoose';
import { ObjectId } from 'mongodb';

import { IUser } from '../user/types';
import { ICommandContext } from '../../types';

export interface IGuildImage {
  ref: string;
  url: string;
  user: ObjectId | IUser;
}

export interface IGuild extends Document {
  discordId: string;
  prefix?: string;
  images: IGuildImage[];
  addImageLink: (image: IGuildImage) => Promise<IGuild>;
  removeImageLink: (image: IGuildImage) => Promise<IGuild>;
}

export interface IGuildModel extends Model<IGuild> {
  addImageLink: (context: ICommandContext) => Promise<any>;
  findOneByDiscordId: (discordId: string) => Promise<IGuild | null>;
  removeImageLink: (context: ICommandContext) => Promise<any>;
}
