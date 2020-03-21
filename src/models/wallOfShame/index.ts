import { Schema, model } from 'mongoose';
import { IWallOfShame, IWallOfShameModel } from './types';

const options = { timestamps: true };

const WallOfShameSchema: Schema = new Schema({
  guild: {
    type: String,
    required: true,
    index: true,
  },
  user: {
    type: String,
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
  },
}, options);

export default model<IWallOfShame, IWallOfShameModel>('wallOfShame', WallOfShameSchema);
