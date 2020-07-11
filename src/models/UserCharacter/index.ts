import {
  SchemaOptions,
  Schema,
  Types,
  model,
} from 'mongoose';

import type { UserCharacterDocument, UserCharacterModel } from '../../types';
import { ModelName } from '../../utils/constants';
import { isDocument } from '../../utils/mongo-common';
import { getCharacterStarRating, getCharacterAdditionalStars } from '../../utils/character';
import * as methods from './methods';

const options: SchemaOptions = {
  timestamps: true,
  toJSON: {
    getters: true,
  },
  toObject: {
    getters: true,
  },
};

const UserCharacterSchema = new Schema({
  character: {
    type: Types.ObjectId,
    ref: ModelName.CHARACTER,
    required: true,
  },
  user: {
    type: Types.ObjectId,
    ref: ModelName.USER,
    required: true,
  },
  count: {
    type: Number,
    default: 1,
  },
}, options);

UserCharacterSchema.virtual('stars').get(function (this: UserCharacterDocument) {
  if (isDocument(this.character)) {
    return getCharacterStarRating(this.character.popularity) + this.additionalStars;
  }

  throw new TypeError('Trying to get stars of a non-populated character');
});

UserCharacterSchema.virtual('additionalStars').get(function (this: UserCharacterDocument) {
  if (isDocument(this.character)) {
    return getCharacterAdditionalStars(this.count);
  }

  throw new TypeError('Trying to get additional stars of a non-populated character');
});

UserCharacterSchema.virtual('baseStars').get(function (this: UserCharacterDocument) {
  if (isDocument(this.character)) {
    return this.stars - this.additionalStars;
  }

  throw new TypeError('Trying to get base stars of a non-populated character');
});

UserCharacterSchema.index({ user: 1, character: 1 }, { unique: true });

Object.assign(UserCharacterSchema, { methods });

export const UserCharacter = model<UserCharacterDocument, UserCharacterModel>(
  ModelName.USER_CHARACTER,
  UserCharacterSchema,
);
