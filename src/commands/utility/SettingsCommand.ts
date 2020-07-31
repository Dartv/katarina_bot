import { Command, TypeResolver } from 'diskat';

import { Context, UserDocument } from '../../types';
import {
  Trigger,
  CommandGroupName,
  UserSettingName,
  UserSetting,
  ParameterType,
} from '../../utils/constants';
import { injectUser } from '../middleware';

interface SettingsCommandContext extends Context {
  user: UserDocument;
  args: {
    option: UserSettingName;
    value: UserSetting;
  };
}

const numericUserSettings = Object.values(UserSetting).filter(s => typeof s === 'number');

const SettingsCommand: Command<SettingsCommandContext> = async (context) => {
  const {
    user,
    args: { option, value },
  } = context;

  user.settings[option] = value;
  await user.save();

  return null;
};

SettingsCommand.config = {
  triggers: Trigger.SETTINGS,
  description: 'Change your settings',
  middleware: [
    injectUser(),
  ],
  group: CommandGroupName.UTILITY,
  parameters: [
    {
      name: 'option',
      description: Object.values(UserSettingName).join('/'),
      type: TypeResolver.oneOf(
        ParameterType.STRING_LOWER,
        Object.values(UserSettingName),
      ),
    },
    {
      name: 'value',
      description: numericUserSettings.join('/'),
      type: TypeResolver.oneOf(
        ParameterType.INTEGER,
        numericUserSettings,
      ),
    },
  ],
};

export default SettingsCommand;
