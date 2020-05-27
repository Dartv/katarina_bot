import { Middleware, ICommandContext } from 'ghastly';
import R from 'ramda';
import { User } from 'discord.js';

import { Mission } from '../../models';
import { IMission } from '../../models/mission/types';
import { SuccessResponse } from '../responses/SuccessResponse';
import { MissionCode, RewardTable } from '../../util';
import { getDailyResetDate } from '../../util/daily';
import { IUser } from '../../models/user/types';
import { ErrorResponse } from '../responses/ErrorResponse';

const rewardUser = async (reward: number, context: ICommandContext): Promise<void> => {
  const { user, dispatch } = context;

  if (reward) {
    user.currency += reward;
    await user.save();

    const response = new SuccessResponse(
      'Mission completed',
      `You received ${reward}💎`,
      context,
    );
    await dispatch(response);
  }
};

const tryCompleteFinalDailyMission = async (context: ICommandContext): Promise<void> => {
  const { user } = context;
  const code = MissionCode.ALL_COMPLETE;
  const codes = R.without([code], Object.values(MissionCode));
  const missions = await Mission.find({ code: { $in: codes }, user: user._id }, 'completedAt');

  if (missions.length === codes.length) {
    if (missions.every(m => m.completedAt)) {
      let mission = await Mission.findOne({ code, user: user._id });

      if (!mission) {
        mission = new Mission({ code, user: user._id });
      }

      mission.completedAt = new Date();
      mission.resetsAt = getDailyResetDate();

      await mission.save();

      await rewardUser(RewardTable.ALL_COMPLETE, context);
    }
  }
};

const withMission = (
  config: (context: ICommandContext) => Promise<{
    code: string;
    reward?: number;
    user?: IUser;
    discordUser?: User;
    update: (mission: IMission, response: any) => Promise<IMission>;
  }>,
): Middleware => async (next, context) => {
  const res = await next(context);

  if (res instanceof ErrorResponse) return res;

  const {
    code,
    reward,
    update,
    user = context.user as IUser,
    discordUser = context.message.author,
  } = await config(context);
  let mission = await Mission.findOne({ code, user: user._id });

  if (!mission) {
    mission = new Mission({ code, user: user._id });
  }

  if (mission.completedAt) return res;

  mission = await update(mission, res);

  await mission.save();

  if (mission.completedAt) {
    const ctx = { ...context };

    ctx.message.author = discordUser;
    ctx.user = user;

    await rewardUser(reward, ctx);

    await tryCompleteFinalDailyMission(ctx);
  }

  return res;
};

export default withMission;
