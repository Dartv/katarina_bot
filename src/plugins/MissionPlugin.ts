import { Plugin, MissionDescriptor, BossDocument } from '../types';
import { ErrorResponse, SuccessResponse } from '../commands/responses';
import { Mission, BossParticipant } from '../models';
import {
  MissionType,
  MissionCode,
  Missions,
  MissionFrequency,
  DAYS_IN_WEEK,
} from '../utils/constants';
import { getDailyResetDate, getWeeklyResetDate } from '../utils/daily';
import { capitalize } from '../utils/common';

export const MissionPlugin: Plugin = (client) => {
  client.emitter.on('mission', async (code, value, context) => {
    try {
      if (!Object.values(MissionCode).includes(code)) {
        throw new Error(`Mission ${code} does not exist`);
      }

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
          frequency: Missions[code].frequency,
        });
      }

      if (mission.completedAt) {
        client.logger.info(`Mission ${code} for user ${user.id} is already completed`);
        return;
      }

      if (!mission.resetsAt) {
        if (mission.type === MissionType.REGULAR) {
          if (mission.frequency === MissionFrequency.DAILY) {
            mission.resetsAt = getDailyResetDate();
          }

          if (mission.frequency === MissionFrequency.WEEKLY) {
            mission.resetsAt = getWeeklyResetDate();
          }
        }
      }

      switch (code) {
        case MissionCode.CURRENCY_DAILY:
        case MissionCode.ROLL_DAILY:
        case MissionCode.DUEL_DAILY:
        case MissionCode.BATTLE_ROYALE_DAILY:
        case MissionCode.QUIZ_DAILY:
        case MissionCode.WORLD_BOSS_DAILY:
        case MissionCode.VERSUS_DAILY: {
          mission.completedAt = new Date();
          break;
        }
        case MissionCode.ALL_COMPLETE_DAILY: {
          const codes = Object.entries(Missions)
            .filter(([key, descriptor]) => (
              descriptor.frequency === MissionFrequency.DAILY && key !== MissionCode.ALL_COMPLETE_DAILY
            ))
            .map(([key]) => key);
          const missions = await Mission.find({
            code: { $in: codes },
            user: user._id,
          }).select('completedAt');

          if (missions.length === codes.length) {
            if (missions.every(m => m.completedAt)) {
              mission.completedAt = new Date();

              client.emitter.emit('mission', MissionCode.ALL_COMPLETE_WEEKLY, value, context);
            }
          }
          break;
        }
        case MissionCode.DEFEAT_WORLD_BOSS_WEEKLY: {
          const boss = value as BossDocument;
          const cursor = BossParticipant.find({ boss: boss._id }).cursor();
          const weeklyResetDate = getWeeklyResetDate();
          await cursor.eachAsync(async (participant) => {
            await Mission.findOneAndUpdate(
              {
                code,
                user: participant.user,
              },
              {
                $set: {
                  completedAt: new Date(),
                },
                $setOnInsert: {
                  code,
                  user: participant.user,
                  type: MissionType.REGULAR,
                  frequency: MissionFrequency.WEEKLY,
                  resetsAt: weeklyResetDate,
                },
              },
              { upsert: true },
            );
          });

          break;
        }
        case MissionCode.ALL_COMPLETE_WEEKLY: {
          mission.progress += 1;

          if (mission.progress >= DAYS_IN_WEEK) {
            mission.completedAt = new Date();
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
