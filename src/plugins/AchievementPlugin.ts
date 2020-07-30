import { Plugin, CharacterDocument, SeriesBase } from '../types';
import { AchievementCode } from '../utils/constants';
import {
  UserRoll,
  Character,
  Achievement,
} from '../models';
import { SuccessResponse } from '../commands/responses';

const calculateReward = (n: number): number => Math.ceil(
  Number.MAX_SAFE_INTEGER / (1 + 200000000000000 * Math.exp(-0.05 * n)) / 10
) * 10;

export const AchievementPlugin: Plugin = (client) => {
  client.emitter.on('achievement', async (code, value, context) => {
    try {
      const { user } = context;

      switch (code) {
        case AchievementCode.SERIES_SET: {
          const lastRoll = await UserRoll
            .findOne({ user: user._id })
            .sort({ createdAt: -1 })
            .populate('drop');

          if (lastRoll) {
            const character = lastRoll.drop as CharacterDocument;
            const result = await Character.aggregate<{
              series: SeriesBase;
              count: number;
            }>([
              {
                $match: {
                  series: {
                    $in: character.series,
                  },
                },
              },
              {
                $unwind: '$series',
              },
              {
                $group: {
                  _id: '$series',
                  ids: { $push: '$_id' },
                },
              },
              {
                $lookup: {
                  from: 'usercharacters',
                  as: 'userCharacters',
                  let: { characterIds: '$ids' },
                  pipeline: [
                    {
                      $match: {
                        user: user._id,
                        $expr: {
                          $in: ['$character', '$$characterIds'],
                        },
                      },
                    },
                  ],
                },
              },
              {
                $match: {
                  $expr: {
                    $eq: [
                      { $size: '$ids' },
                      { $size: '$userCharacters' },
                    ],
                  },
                },
              },
              {
                $lookup: {
                  from: 'series',
                  as: 'series',
                  localField: '_id',
                  foreignField: '_id',
                },
              },
              {
                $unwind: '$series',
              },
              {
                $project: {
                  series: 1,
                  count: { $size: '$ids' },
                },
              },
            ]);
            const promises = result.map(async ({ series, count }) => {
              let achievement = await Achievement.findOne({
                code: AchievementCode.SERIES_SET,
                user: user._id,
                'meta.series': series._id,
              });

              if (!achievement) {
                achievement = await new Achievement({
                  code: AchievementCode.SERIES_SET,
                  user: user._id,
                  completedAt: new Date(),
                  meta: {
                    series: series._id,
                  },
                }).save();
                const reward = calculateReward(count);

                user.currency += reward;
                await user.save();

                await new SuccessResponse({
                  title: 'Achievement completed',
                  description: series.title,
                  modify: (embed) => embed
                    .addField(
                      'Achievement',
                      'Collect full set',
                      true,
                    )
                    .addField(
                      'Reward',
                      `${reward} 💎`,
                      true,
                    ),
                }, context).respond();
              }
            });
            await Promise.all(promises);
          }
          break;
        }
        default:
      }
    } catch (err) {
      client.emit('error', err);
    }
  });
};
