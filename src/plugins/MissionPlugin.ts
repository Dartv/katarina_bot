import { Plugin, MissionDescriptor } from '../types';
import { ErrorResponse, SuccessResponse } from '../commands/responses';
import { Mission } from '../models';
import { MissionType, MissionCode, Missions } from '../utils/constants';
import { getDailyResetDate } from '../utils/daily';
import { capitalize } from '../utils/common';

export const MissionPlugin: Plugin = (client) => {
  client.emitter.on('mission', async (code, value, context) => {
    try {
      const { user } = context;

      if (value instanceof ErrorResponse || !user) {
        return;
      }

      client.logger.info(`Received mission ${code} for user ${user.id}`);

      let mission = await Mission.findOne({ code, user: user._id });

      if (!mission) {
        mission = new Mission({
          code,
          user: user._id,
          type: MissionType.REGULAR,
        });
      }

      if (mission.completedAt) {
        client.logger.info(`Mission ${code} for user ${user.id} is already completed`);
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
          mission.completedAt = new Date();
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
        case MissionCode.VERSUS_DAILY: {
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
        const descriptor: MissionDescriptor | undefined = Missions[mission.code];

        if (descriptor) {
          user.currency += descriptor.reward;
          await user.save();

          if (!context.silent) {
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
