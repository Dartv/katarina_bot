import { SchemaOptions, Schema, model } from 'mongoose';

import type { GuildDocument, GuildModel } from '../../types';
import { GuildSetting, ModelName } from '../../utils/constants';

const options: SchemaOptions = { timestamps: true };

const GuildSchema = new Schema({
  discordId: {
    type: String,
    required: true,
  },
  services: {
    type: {
      scoresaber: {
        type: new Schema({
          playerIds: {
            type: [{
              type: String,
              required: true,
            }],
            default: [],
          },
        }),
      },
    },
    default: {},
  },
  settings: {
    type: new Schema({
      [GuildSetting.BOSS_CHANNEL]: {
        type: String,
        default: null,
      },
      [GuildSetting.WARS_CHANNEL]: {
        type: String,
        default: null,
      },
      [GuildSetting.ROYALE_CHANNEL]: {
        type: String,
        default: null,
      },
    }),
    default: {},
  },
}, options);

GuildSchema.index({ discordId: 1 });

export const Guild = model<GuildDocument, GuildModel>(ModelName.GUILD, GuildSchema);
