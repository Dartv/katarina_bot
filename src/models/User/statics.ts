import { UserModel } from '../../types';

export const register: UserModel['register'] = function (user) {
  return this.findOneAndUpdate({ discordId: user.id }, {
    $set: {
      discordId: user.id,
      username: user.username,
      discriminator: user.discriminator,
    },
  }, { upsert: true }).exec();
};
