import {
  Command,
  TypeResolver,
  ParameterType,
} from 'diskat';

import { Trigger, BannerType, CommandGroupName } from '../../utils/constants';
import { RollCommandContext, CharacterDocument } from '../../types';
import { injectUser } from '../middleware';
import { rollLocalCharacter, rollExternalCharacter, rollBannerCharacter } from '../../utils/roll';
import { UserRoll } from '../../models';

const roll = async (context: RollCommandContext): Promise<CharacterDocument> => {
  const { args: { banner }, user } = context;
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
      type: TypeResolver.compose(
        ParameterType.STRING,
        (banner: string) => banner.trim().toLowerCase(),
        TypeResolver.oneOf(
          ParameterType.STRING,
          Object.values(BannerType),
        ),
      ),
    },
  ],
  middleware: [
    injectUser(),
  ],
  group: CommandGroupName.GACHA,
};

export default RollCommand;