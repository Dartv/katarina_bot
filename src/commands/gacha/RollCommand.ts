import {
  Command,
  TypeResolver,
  ParameterType,
  expectGuild,
} from 'diskat';

import { Trigger, BannerType, CommandGroupName } from '../../utils/constants';
import { RollCommandContext, CharacterDocument } from '../../types';
import { injectUser } from '../middleware';
import { rollLocalCharacter, rollExternalCharacter } from '../../utils/roll';

const roll = async (context: RollCommandContext): Promise<CharacterDocument> => {
  const { args: { banner } } = context;
  switch (banner) {
    case BannerType.LOCAL:
      return rollLocalCharacter();
    case BannerType.NORMAL:
    default:
      return rollExternalCharacter();
  }
};

const RollCommand: Command<RollCommandContext> = async (context) => {
  const { user, message } = context;

  const character = await roll(context);
  const userCharacter = await user.characters.add(character);

  await message.reply('', { embed: userCharacter.createEmbed() });

  user.lastRolledAt = new Date();

  await user.save();

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
    expectGuild(),
    injectUser(),
  ],
  group: CommandGroupName.GACHA,
};

export default RollCommand;
