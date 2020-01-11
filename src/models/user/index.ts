import { model, Schema, SchemaTypes } from 'mongoose';
import * as statics from './statics';
import * as methods from './methods';
import Character from '../character';
import { DECK_LIMIT } from '../../util';
import { IUser, IUserModel } from './types';

const options = { timestamps: true };

const UserSchema = new Schema({
  discordId: { type: String, required: true, index: true },
  images: {
    type: [{
      ref: {
        type: String,
        maxlength: 40,
      },
      url: {
        type: String,
        maxlength: 2000,
      },
    }],
    max: 50,
    default: [],
  },
  characters: {
    type: [SchemaTypes.ObjectId],
    default: [],
  },
  favorites: {
    type: [SchemaTypes.ObjectId],
    default: [],
    max: 20,
  },
  lastRolledAt: Date,
  waifu: {
    type: SchemaTypes.ObjectId,
    ref: Character.modelName,
  },
  quote: String,
  deck: {
    type: [{
      type: SchemaTypes.ObjectId,
      ref: Character.modelName,
    }],
    default: [],
    min: DECK_LIMIT,
    max: DECK_LIMIT,
  },
}, options);

Object.assign(UserSchema, { statics, methods });

export default model<IUser, IUserModel>('user', UserSchema);
