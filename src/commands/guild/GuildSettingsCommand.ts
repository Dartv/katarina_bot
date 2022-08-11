import { TextChannel } from 'discord.js';
import {
  Command,
  expectGuild,
  expectPermissions,
  TypeResolver,
  TypeResolverContext,
} from 'diskat';

import { Context, GuildDocument } from '../../types';
import { CommandGroupName, GuildSetting, Trigger } from '../../utils/constants';
import { injectGuild } from '../middleware';
import { ErrorResponse, SuccessResponse } from '../responses';

export enum GuildSettingOption {
  BOSS_CHANNEL = 'boss',
  WARS_CHANNEL = 'wars',
  ROYALE_CHANNEL = 'royale',
  VRC_WORLDS_CHANNEL = 'vrcworlds',
}

export const GuildSettingOptionToSetting = {
  [GuildSettingOption.BOSS_CHANNEL]: GuildSetting.BOSS_CHANNEL,
  [GuildSettingOption.WARS_CHANNEL]: GuildSetting.WARS_CHANNEL,
  [GuildSettingOption.ROYALE_CHANNEL]: GuildSetting.ROYALE_CHANNEL,
  [GuildSettingOption.VRC_WORLDS_CHANNEL]: GuildSetting.VRC_WORLDS_CHANNEL,
};

interface GuildSettingsContext extends Context {
  args: {
    option: GuildSettingOption;
    value: TextChannel;
  };
  guild: GuildDocument;
}

const GuildSettingsCommand: Command<GuildSettingsContext> = async (context): Promise<any> => {
  const { guild, args: { option, value } } = context;
  const setting = GuildSettingOptionToSetting[option];

  switch (setting) {
    case GuildSetting.BOSS_CHANNEL:
    case GuildSetting.WARS_CHANNEL:
    case GuildSetting.ROYALE_CHANNEL:
    case GuildSetting.VRC_WORLDS_CHANNEL: {
      guild.settings[setting] = value.id;
      break;
    }
    default: {
      return new ErrorResponse(context);
    }
  }

  await guild.save();

  return new SuccessResponse({
    title: `${option} channel successfully set`,
  }, context);
};

GuildSettingsCommand.config = {
  triggers: Trigger.GUILD_SETTINGS,
  description: 'Change settings of your instance, configure Waifu Royale, World Boss, etc.',
  parameters: [
    {
      name: 'option',
      type: TypeResolver.oneOf(
        TypeResolver.Types.STRING_LOWER,
        Object.values(GuildSettingOption),
      ),
      description: Object.values(GuildSettingOption).join('/'),
    },
    {
      name: 'value',
      type: TypeResolver.compose(
        TypeResolver.Types.STRING_LOWER,
        (context: TypeResolverContext & { args: { option: GuildSettingOption } }) => {
          const { args: { option }, client } = context;

          switch (option) {
            case GuildSettingOption.BOSS_CHANNEL:
            case GuildSettingOption.WARS_CHANNEL:
            case GuildSettingOption.ROYALE_CHANNEL:
            case GuildSettingOption.VRC_WORLDS_CHANNEL:
              return client.types.resolve(TypeResolver.Types.TEXT_CHANNEL, context);
            default:
              return null;
          }
        },
      ),
      description: 'channel',
    },
  ],
  middleware: [
    expectGuild(),
    expectPermissions(['ADMINISTRATOR']),
    injectGuild(),
  ],
  group: CommandGroupName.GUILD,
};

export default GuildSettingsCommand;
