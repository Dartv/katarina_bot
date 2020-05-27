import { ICommand, ICommandHandler } from 'ghastly';
import { COMMAND_TRIGGERS } from '../util';
import { injectUser } from './middleware';
import { UserSettingName, UserSetting } from '../models/user/types';
import { ErrorResponse } from './responses/ErrorResponse';

const handler: ICommandHandler = async (context): Promise<any> => {
  const {
    user,
    formatter,
    args: { name, value },
    client: { dispatcher },
  } = context;

  if (!Object.values(UserSettingName).includes(name)) {
    return new ErrorResponse(
      `${formatter.code(name)} is not a valid setting. `
      + `Type ${formatter.code(`${dispatcher.prefix}help settings`)} for more info`,
      context,
    );
  }

  user.settings[name] = Number.parseInt(value, 10);
  await user.save();
  return null;
};

export default (): ICommand => ({
  handler,
  middleware: [injectUser()],
  triggers: COMMAND_TRIGGERS.SETTINGS,
  parameters: [
    {
      name: 'name',
      description: Object.values(UserSettingName).join('/'),
    },
    {
      name: 'value',
      description: Object.values(UserSetting).filter(s => typeof s === 'number').join('/'),
    },
  ],
  description: 'Your settings',
});
