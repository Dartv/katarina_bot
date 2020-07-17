import {
  SchemaOptions,
  Schema,
  model,
  Types,
} from 'mongoose';
import { UserRollDocument, UserRollModel } from '../../types';
import { ModelName, BannerType } from '../../utils/constants';
import { Banner } from '../Banner';

const options: SchemaOptions = { timestamps: true };

const UserRollSchema = new Schema({
  drop: {
    type: Types.ObjectId,
    ref: ModelName.CHARACTER,
    required: true,
  },
  user: {
    type: Types.ObjectId,
    ref: ModelName.USER,
    required: true,
  },
  banner: {
    type: {},
    required: true,
    validate(value: unknown) {
      if (typeof value === 'string') {
        return Object.values(BannerType).includes(value as BannerType);
      }

      return value instanceof Types.ObjectId;
    },
  },
}, options);

UserRollSchema.virtual('bannerRef', {
  ref: ModelName.CHARACTER,
  localField: 'banner',
  foreignField: '_id',
  justOne: true,
});

UserRollSchema.index({ user: 1, banner: 1 });
UserRollSchema.index({ createdAt: 1 }, { expires: '30d' });

UserRollSchema.pre<UserRollDocument>('save', async function () {
  if (this.banner === BannerType.CURRENT) {
    const banner = await Banner.fetchLatest();
    this.banner = banner._id;
  }
});

export const UserRoll = model<UserRollDocument, UserRollModel>(ModelName.USER_ROLL, UserRollSchema);
