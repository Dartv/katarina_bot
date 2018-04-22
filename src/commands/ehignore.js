import { COMMAND_TRIGGERS } from '../util/constants';
import { User } from '../models';

export const handler = async ({ args: { tags } }) => {
    console.log(tags);
};

export default () => ({
  handler,
  parameters: [{
      name: 'tags',
      description: 'tags',
      optional: true,
      repeatable: true,
      defaultValue: true,
  }],
  triggers: COMMAND_TRIGGERS.EHIGNORE,
  description: 'EH tags to ignore',
});
