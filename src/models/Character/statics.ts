import { Types } from 'mongoose';

import { CharacterModel } from '../../types';

export const random: CharacterModel['random'] = async function (n, pipeline = []) {
  const characters: { _id: Types.ObjectId }[] = await this.aggregate([
    ...pipeline,
    { $sample: { size: n } },
    {
      $project: {
        _id: 1,
      },
    },
  ]);
  return this
    .find({ _id: { $in: characters.map(({ _id }) => _id) } })
    .populate('series');
};

export const search: CharacterModel['search'] = async function (options) {
  return this.aggregate([
    {
      $match: {
        $text: {
          $search: options.searchTerm,
        },
        ...(options.series && {
          series: {
            $in: options.series,
          },
        }),
        ...(options.match || {}),
      },
    },
    {
      $addFields: {
        score: {
          $meta: 'textScore',
        },
      },
    },
    {
      $sort: {
        score: {
          $meta: 'textScore',
        },
      },
    },
    ...(options.skip ? [{ $skip: options.skip }] : []),
    ...(options.limit ? [{ $limit: options.limit }] : []),
    ...(options.populate ? [
      {
        $lookup: {
          from: 'series',
          as: 'series',
          localField: 'series',
          foreignField: '_id',
        },
      },
    ] : []),
    ...(options.project ? [{ $project: options.project }] : []),
  ]);
};
