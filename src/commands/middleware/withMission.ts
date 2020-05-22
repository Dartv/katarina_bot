import { Middleware, ICommandContext } from 'ghastly';
import { Mission } from '../../models';
import { IMission } from '../../models/mission/types';
import { SuccessResponse } from '../responses/SuccessResponse';

const withMission = (
  config: (context: ICommandContext) => Promise<{
    code: string;
    reward?: number;
    update: (mission: IMission) => Promise<IMission>;
  }>,
): Middleware => async (next, context) => {
  const res = await next(context);

  const { dispatch, user } = context;
  const { code, reward, update } = await config(context);
  let mission = await Mission.findOne({ code, user: user._id });

  if (!mission) {
    mission = new Mission({ code, user: user._id });
  }

  if (mission.completedAt) return res;

  mission = await update(mission);

  await mission.save();

  if (mission.completedAt) {
    if (reward) {
      user.currency += reward;
      await user.save();
    }

    const response = new SuccessResponse(
      'Mission completed',
      `You received ${reward}💎`,
      context,
    );
    await dispatch(response);
  }

  return res;
};

export default withMission;
