import { Types, Model, Document } from 'mongoose';
import { ObjectId } from 'mongodb';

import { CharacterStar } from '../../util';

export interface ICharacter extends Document {
  name: string;
  stars: CharacterStar;
  popularity: number;
  slug: string;
  imageUrl: string;
  series: ObjectId[] | Types.DocumentArray<any>[];
  cardImageUrl: string;
  getStarRating(): CharacterStar;
}

export interface ICharacterModel extends Model<ICharacter> {
  random(n: number, pipeline?: object[]): Promise<ICharacter[]>;
}
