import { ICommand, ICommandHandler } from 'ghastly';
import R from 'ramda';

import { COMMAND_TRIGGERS, Missions, capitalize } from '../util';
import { injectUser } from './middleware';
import { Mission } from '../models';

const handler: ICommandHandler = async (context) => {
  const { user, formatter } = context;
  const missionsByCode = await Mission.find({ user: user._id }).then(R.indexBy(R.prop('code')));
  const missions = Object.keys(Missions).map((code) => {
    const existingMission = missionsByCode[code];

    if (existingMission) return existingMission;

    const mockMission = new Mission({
      code,
      user: user._id,
    });

    return mockMission;
  });

  return [
    formatter.bold('Missions:'),
    ...missions.map(({ code, completedAt }) => {
      const { reward, description } = Missions[code];
      const text = `${capitalize(description)} (${formatter.bold(`${reward}💎`)})`;
      return completedAt ? formatter.strikeout(text) : text;
    }),
  ].join('\n');
};

export default (): ICommand => ({
  handler,
  middleware: [injectUser()],
  triggers: COMMAND_TRIGGERS.MISSIONS,
  description: 'Displays your missions',
});
