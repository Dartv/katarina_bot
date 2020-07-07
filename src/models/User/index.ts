import {
  SchemaOptions,
  Schema,
  SchemaTypes,
  model,
} from 'mongoose';

import type { UserDocument, UserModel } from '../../types';
import { ModelName, DefaultUserSettings } from '../../utils/constants';

const options: SchemaOptions = { timestamps: true };

export const UserSchema = new Schema({
  discordId: {
    type: String,
    required: true,
  },
  username: String,
  discriminator: String,
  characters: {
    type: [{
      type: SchemaTypes.ObjectId,
      ref: ModelName.USER_CHARACTER,
    }],
    default: [],
  },
  favorites: {
    type: [{
      type: SchemaTypes.ObjectId,
      ref: ModelName.CHARACTER,
    }],
    default: [],
  },
  lastRolledAt: Date,
  waifu: {
    type: SchemaTypes.ObjectId,
    ref: ModelName.CHARACTER,
  },
  quote: String,
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
  settings: {
    type: {
      displayrollprice: {
        type: Number,
        min: 0,
        max: 1,
        default: DefaultUserSettings.displayrollprice,
      },
    },
    default: DefaultUserSettings,
  },
}, options);

UserSchema.index({ discordId: 1 });

export const User = model<UserDocument, UserModel>(ModelName.USER, UserSchema);
