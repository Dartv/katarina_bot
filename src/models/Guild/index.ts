import { SchemaOptions, Schema, model } from 'mongoose';

import type { GuildDocument, GuildModel } from '../../types';
import { ModelName } from '../../utils/constants';

const options: SchemaOptions = { timestamps: true };

const GuildSchema = new Schema({
  discordId: {
    type: String,
    required: true,
  },
  services: {
    type: {
      scoresaber: {
        type: {
          playerIds: {
            type: [{
              type: String,
              required: true,
            }],
            default: [],
          },
        },
      },
    },
    default: {},
  },
}, options);

GuildSchema.index({ discordId: 1 });

export const Guild = model<GuildDocument, GuildModel>(ModelName.GUILD, GuildSchema);
