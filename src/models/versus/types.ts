import { Document, Types, Model } from 'mongoose';
import { ICharacter } from '../character/types';
import { IGuild } from '../guild/types';
import { IUser } from '../user/types';

export interface IVersusCharacter {
  self: ICharacter | Types.ObjectId;
  messageId: string;
  votes?: number;
}

export interface IVersus extends Document {
  characters: IVersusCharacter[];
  winner?: ICharacter | Types.ObjectId;
  guild: IGuild | Types.ObjectId;
  createdBy: IUser | Types.ObjectId;
}

export type IVersusModel = Model<IVersus>;
