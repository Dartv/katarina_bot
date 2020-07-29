import { subDays } from 'date-fns';

import { Plugin, Context, UserDocument } from '../types';
import { ErrorResponse, SuccessResponse } from '../commands/responses';
import { Mission, UserRoll } from '../models';
import { MissionType, MissionCode, Missions } from '../utils/constants';
import { getDailyResetDate } from '../utils/daily';
import { capitalize } from '../utils/common';

interface MissionContext extends Context {
  user?: UserDocument;
}

export const MissionPlugin: Plugin = (client) => {
  client.emitter.on('mission', async (code, value, context: MissionContext) => {
    try {
      const { user } = context;

      if (value instanceof ErrorResponse || !user) {
        return;
      }

      let mission = await Mission.findOne({ code, user: user._id });

      if (!mission) {
        mission = new Mission({
          code,
          user: user._id,
          type: MissionType.REGULAR,
        });
      }

      if (mission.completedAt) {
        return;
      }

      if (mission.type === MissionType.REGULAR) {
        mission.resetsAt = getDailyResetDate();
      }

      switch (code) {
        case MissionCode.CURRENCY_DAILY: {
          mission.completedAt = new Date();
          break;
        }
        case MissionCode.ROLL_DAILY: {
          const count = await UserRoll.countDocuments({
            user: user._id,
            createdAt: {
              $gte: subDays(new Date(mission.resetsAt), 1),
            },
          });

          if (count >= 3) {
            mission.completedAt = new Date();
          }
          break;
        }
        case MissionCode.DUEL_DAILY: {
          mission.completedAt = new Date();
          break;
        }
        case MissionCode.BATTLE_ROYALE_DAILY: {
          mission.completedAt = new Date();
          break;
        }
        case MissionCode.QUIZ_DAILY: {
          mission.completedAt = new Date();
          break;
        }
        case MissionCode.ALL_COMPLETE_DAILY: {
          const codes = Object.values(MissionCode).filter(c => c !== MissionCode.ALL_COMPLETE_DAILY);
          const missions = await Mission.find({
            code: { $in: codes },
            user: user._id,
          }).select('completedAt');

          if (missions.length === codes.length) {
            if (missions.every(m => m.completedAt)) {
              mission.completedAt = new Date();
            }
          }
          break;
        }
        default:
          break;
      }

      await mission.save();

      if (mission.completedAt) {
        const descriptor = Missions[mission.code];

        if (descriptor) {
          await new SuccessResponse({
            title: 'Mission Completed',
            modify: (embed) => embed
              .addField(
                'Mission',
                capitalize(descriptor.description),
                true,
              )
              .addField(
                'Reward',
                `${descriptor.reward} 💎`,
                true,
              ),
          }, context).respond();
        }

        if (mission.type === MissionType.REGULAR) {
          client.emitter.emit('mission', MissionCode.ALL_COMPLETE_DAILY, value, context);
        }
      }
    } catch (err) {
      client.emit('error', err);
    }
  });
};
