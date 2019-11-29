import { Schema, SchemaTypes, model } from 'mongoose';
import { isNumber } from 'util';

import { CharacterStar } from '../../util';
import Series from '../series';

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
  series: [{
    type: SchemaTypes.ObjectId,
    ref: Series.modelName,
  }],
  cardImageUrl: {
    type: String,
    required: true,
  },
}, options);

CharacterSchema.index({ name: 'text' });

export default model('character', CharacterSchema);
