import { model, Schema } from 'mongoose';

import * as statics from './statics';
import * as methods from './methods';
import { IGuild, IGuildModel } from './types';

const options = { timestamps: true };

const GuildSchema = new Schema({
  discordId: { type: String, required: true, index: true },
  prefix: { type: String, index: true },
  images: {
    type: [{
      ref: {
        type: String,
        maxlength: 40,
        required: true,
      },
      url: {
        type: String,
        maxlength: 2000,
        required: true,
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
      },
    }],
    max: 200,
    default: [],
  },
}, options);

Object.assign(GuildSchema, { statics, methods });

export default model<IGuild, IGuildModel>('guild', GuildSchema);
