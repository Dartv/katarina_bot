import { Banner, COMMAND_TRIGGERS } from '../../util';
import { ICommand, ICommandHandler } from '../../types';
import { ICharacter } from '../../models/character/types';
import { User } from '../../models';
import { injectUser } from '../middleware';
import { rollLocalBanner } from './rollLocalBanner';
import { rollNormalBanner } from './rollNormalBanner';

const middleware = [
  injectUser(),
];

const handler: ICommandHandler = async (context): Promise<any> => {
  const { args } = context;
  const banner: Banner = args.banner.trim().toLowerCase();
  let character: ICharacter;

  if (banner === Banner.LOCAL) {
    character = await rollLocalBanner(context);
  } else {
    character = await rollNormalBanner(context);
  }

  await User.findByIdAndUpdate(context.user.id, {
    $push: {
      characters: character._id,
    },
    $set: {
      lastRolledAt: new Date(),
    },
  });
};

export default (): ICommand => ({
  middleware,
  handler,
  parameters: [
    {
      name: 'banner',
      description: 'banner to roll on',
      optional: true,
      defaultValue: Banner.NORMAL,
    },
  ],
  triggers: COMMAND_TRIGGERS.ROLL,
  description: 'Waifu gacha game. Available banners are Normal (default) and Local (has unique characters)',
});
