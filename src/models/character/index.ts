import { ObjectId } from 'mongodb';
import {
  Schema,
  SchemaTypes,
  model,
  Document,
  Types,
} from 'mongoose';
import { isNumber } from 'util';

import { CharacterStar } from '../../util';
import Series from '../series';
import * as methods from './methods';

export interface ICharacter extends Document {
  name: string;
  stars: CharacterStar;
  popularity: number;
  slug: string;
  imageUrl: string;
  series: ObjectId[] | Types.DocumentArray<any>[];
  cardImageUrl: string;
}

const options = { timestamps: true };

const stars = Object.values(CharacterStar).filter(isNumber);

const CharacterSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
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
      ref: Series.modelName,
    }],
    default: [],
  },
  cardImageUrl: {
    type: String,
    required: true,
  },
}, options);

CharacterSchema.index({ name: 'text' });

Object.assign(CharacterSchema, { methods });

export default model<ICharacter>('character', CharacterSchema);
