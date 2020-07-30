import { Command, TypeResolver, branch } from 'diskat';
import { URL } from 'url';

import {
  Trigger,
  BannerType,
  CommandGroupName,
  MissionCode,
  AchievementCode,
  ParameterType,
} from '../../utils/constants';
import { CharacterDocument, Context, UserDocument } from '../../types';
import { injectUser, withInMemoryCooldown } from '../middleware';
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
  const { user, message, args: { banner } } = context;

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

  await message.reply('', { embed: userCharacter.createEmbed() });

  return null;
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
    branch(
      ({ args }: RollCommandContext) => !!args.url,
      expectOwner(),
    ),
    injectUser(),
    withInMemoryCooldown<RollCommandContext>(async ({ user }) => ({
      max: 1,
      window: 2,
      userId: user.id,
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
