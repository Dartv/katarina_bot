import {
  Schema,
  SchemaTypes,
  model,
} from 'mongoose';
import { isNumber } from 'util';

import { ICharacter, ICharacterModel } from './types';
import { CharacterStar } from '../../util';
import * as methods from './methods';
import * as statics from './statics';

const options = { timestamps: true };

const stars = Object.values(CharacterStar).filter(isNumber);

const CharacterSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  stars: {
    type: Number,
    min: Math.min(...stars),
    max: Math.max(...stars),
    required: true,
    index: true,
  },
  popularity: {
    type: Number,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  series: {
    type: [{
      type: SchemaTypes.ObjectId,
      ref: 'series',
    }],
    default: [],
  },
  cardImageUrl: String,
}, options);

CharacterSchema.index({ name: 'text' });

Object.assign(CharacterSchema, { methods, statics });

export default model<ICharacter, ICharacterModel>('character', CharacterSchema);
