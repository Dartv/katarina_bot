import {
  SchemaOptions,
  Schema,
  model,
  Types,
} from 'mongoose';

import type { UserDocument, UserModel } from '../../types';
import { ModelName, DefaultUserSettings } from '../../utils/constants';
import { UserCharacters } from './UserCharacters';

const options: SchemaOptions = { timestamps: true };

export const UserSchema = new Schema({
  discordId: {
    type: String,
    required: true,
  },
  username: String,
  discriminator: String,
  favorites: {
    type: [{
      type: Types.ObjectId,
      ref: ModelName.CHARACTER,
    }],
    default: [],
  },
  lastRolledAt: Date,
  waifu: {
    type: Types.ObjectId,
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

UserSchema.virtual('characters').get(function (this: UserDocument) {
  this.$locals._characters = this.$locals._characters || new UserCharacters(this);
  return this.$locals._characters;
});

UserSchema.pre('save', async function (this: UserDocument) {
  await this.characters.save();
});

export const User = model<UserDocument, UserModel>(ModelName.USER, UserSchema);
