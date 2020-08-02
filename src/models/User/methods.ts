import { Types } from 'mongoose';

import { UserDocument } from '../../types';
import { UserCharacter } from '../UserCharacter';
import { Character } from '../Character';
import { Series } from '../Series';
import { adjustStars, getUserCharactersWithStarsPipeline } from '../../utils/character';

export const searchCharacters: UserDocument['searchCharacters'] = async function (options) {
  let seriesIds: Types.ObjectId[] = [];
  let characterIds: Types.ObjectId[] = [];

  if (options.series) {
    const series = await Series.search({
      searchTerm: options.series,
      project: {
        _id: 1,
      },
      limit: 10,
    });
    seriesIds = series.map(({ _id }) => _id);
  }

  if (options.name || options.series || options.ids) {
    const ids = options.ids || await UserCharacter.distinct('character', {
      user: this._id,
    });
    const characters = await Character
      .find({
        _id: { $in: ids },
        ...(options.series && { series: { $in: seriesIds } }),
        ...(options.name && {
          $text: {
            $search: options.name,
          },
        }),
      })
      .select('_id');
    characterIds = characters.map(({ _id }) => _id);
  }

  const pipeline: Record<string, any>[] = [
    {
      $match: {
        user: this._id,
      },
    },
  ];

  if (options.name || options.series || options.ids) {
    pipeline.push(
      {
        $lookup: {
          from: 'characters',
          as: 'character',
          let: { character: '$character' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$_id', '$$character'],
                    },
                    {
                      $in: ['$_id', characterIds],
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    );
  } else {
    pipeline.push({
      $lookup: {
        from: 'characters',
        as: 'character',
        localField: 'character',
        foreignField: '_id',
      },
    });
  }

  pipeline.push(...getUserCharactersWithStarsPipeline().slice(1));

  if (options.stars) {
    pipeline.push({
      $match: {
        stars: adjustStars(options.stars),
      },
    });
  }

  if (options.skip) {
    pipeline.push({ $skip: options.skip });
  }

  if (options.limit) {
    pipeline.push({ $limit: options.limit });
  }

  pipeline.push({
    $lookup: {
      from: 'series',
      as: 'character.series',
      localField: 'character.series',
      foreignField: '_id',
    },
  });

  return UserCharacter.aggregate(pipeline);
};
