import { SchemaOptions, Schema, model } from 'mongoose';

import type { GuildDocument, GuildModel } from '../../types';
import { ModelName } from '../../utils/constants';

const options: SchemaOptions = { timestamps: true };

const GuildSchema = new Schema({
  discordId: {
    type: String,
    required: true,
  },
}, options);

export const Guild = model<GuildDocument, GuildModel>(ModelName.GUILD, GuildSchema);
