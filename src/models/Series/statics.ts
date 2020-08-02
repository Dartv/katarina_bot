import { SeriesModel } from '../../types';

export const search: SeriesModel['search'] = async function (options) {
  return this.aggregate([
    {
      $match: {
        $text: {
          $search: options.searchTerm,
        },
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
    ...(options.project ? [{ $project: options.project }] : []),
  ]);
};
