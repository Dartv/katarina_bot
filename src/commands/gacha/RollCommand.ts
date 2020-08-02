import { Command, TypeResolver, branch } from 'diskat';
import { URL } from 'url';

import {
  Trigger,
  BannerType,
  CommandGroupName,
  MissionCode,
  AchievementCode,
  ParameterType,
  PriceTable,
} from '../../utils/constants';
import { CharacterDocument, Context, UserDocument } from '../../types';
import { injectUser, withInMemoryCooldown, withPrice } from '../middleware';
import { rollLocalCharacter, rollExternalCharacter, rollBannerCharacter } from '../../utils/roll';
import { UserRoll } from '../../models';
import { expectOwner } from '../middleware/expectOwner';

interface RollCommandContext extends Context {
  user: UserDocument;
  args: {
    banner: BannerType;
    url?: URL;
  };
}

const roll = async (context: RollCommandContext): Promise<CharacterDocument> => {
  const { args: { banner, url }, user } = context;

  if (url) {
    return rollExternalCharacter(url.href);
  }

  switch (banner) {
    case BannerType.LOCAL:
      return rollLocalCharacter();
    case BannerType.CURRENT:
      return rollBannerCharacter(user._id);
    case BannerType.NORMAL:
    default:
      return rollExternalCharacter();
  }
};

const RollCommand: Command<RollCommandContext> = async (context) => {
  const {
    user,
    args: { banner },
    dispatch,
  } = context;

  const character = await roll(context);
  const userCharacter = await user.characters.add(character);

  user.lastRolledAt = new Date();

  await Promise.all([
    new UserRoll({
      drop: character._id,
      user: user._id,
      banner,
    }).save(),
    user.save(),
  ]);

  return dispatch(userCharacter.createEmbed());
};

RollCommand.config = {
  triggers: Trigger.ROLL,
  description: 'Roll your dream waifu',
  parameters: [
    {
      name: 'banner',
      description: Object.values(BannerType).join('/'),
      optional: true,
      defaultValue: BannerType.NORMAL,
      type: TypeResolver.oneOf(
        ParameterType.STRING_LOWER,
        Object.values(BannerType),
      ),
    },
    {
      name: 'url',
      description: 'url (admin only)',
      optional: true,
      defaultValue: '',
      type: ParameterType.URL,
    },
  ],
  middleware: [
    withInMemoryCooldown(async ({ message }) => ({
      max: 1,
      window: 2,
      userId: message.author.id,
    })),
    branch(
      ({ args }: RollCommandContext) => !!args.url,
      expectOwner(),
    ),
    injectUser(),
    withPrice<RollCommandContext>(async ({ args, user }) => ({
      price: args.banner === BannerType.LOCAL ? PriceTable.ROLL_LOCAL : PriceTable.ROLL_NORMAL,
      silent: !user.settings.displayrollprice,
    })),
    async (next, context: RollCommandContext) => {
      const result = await next(context);

      context.client.emitter.emit('mission', MissionCode.ROLL_DAILY, result, context);
      context.client.emitter.emit('achievement', AchievementCode.SERIES_SET, result, context);

      return result;
    },
  ],
  group: CommandGroupName.GACHA,
};

export default RollCommand;
