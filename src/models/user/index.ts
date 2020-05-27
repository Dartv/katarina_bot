import {
  model, Schema, SchemaTypes, SchemaOptions,
} from 'mongoose';
import * as statics from './statics';
import * as methods from './methods';
import { DECK_LIMIT } from '../../util';
import { IUser, IUserModel } from './types';

const options: SchemaOptions = { timestamps: true };

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
  visitedAt: Date,
  waifu: {
    type: SchemaTypes.ObjectId,
    ref: 'character',
  },
  quote: String,
  deck: {
    type: [{
      type: SchemaTypes.ObjectId,
      ref: 'character',
    }],
    default: [],
    min: DECK_LIMIT,
    max: DECK_LIMIT,
  },
  services: {
    type: {
      scoresaber: {
        playerid: String,
      },
    },
    default: {},
  },
  currency: {
    type: Number,
    default: 0,
    min: 0,
  },
  correctQuizGuesses: {
    type: Number,
    default: 0,
    min: 0,
  },
  rolls: {
    type: Number,
    default: 0,
    min: 0,
  },
  settings: {
    type: new Schema({
      displayRollPrice: {
        type: Number,
        min: 0,
        max: 1,
        default: 1,
      },
    }),
    default: {},
  },
}, options);

Object.assign(UserSchema, { statics, methods });

export default model<IUser, IUserModel>('user', UserSchema);
