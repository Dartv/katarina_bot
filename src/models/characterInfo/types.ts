import { Model, Document } from 'mongoose';
import { ObjectId } from 'mongodb';

import { IUser } from '../user/types';
import { ICharacter } from '../character/types';

export interface ICharacterInfo extends Document {
  user: ObjectId | IUser;
  character: ObjectId | ICharacter;
  level: number;
  exp: number;
}

export type ICharacterInfoModel = Model<ICharacterInfo>;
