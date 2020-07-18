import { Types } from 'mongoose';

import { UserDocument } from '../../types';
import { UserCharacter } from '../UserCharacter';
import { Character } from '../Character';
import {
  PopularityThreshold,
  CharacterStar,
  AwakeningStage,
} from '../../utils/constants';
import { Series } from '../Series';
import { adjustStars } from '../../utils/character';

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

  return UserCharacter.aggregate([
    {
      $match: {
        user: this._id,
      },
    },
    {
      $lookup: {
        from: 'characters',
        as: 'character',
        localField: 'character',
        foreignField: '_id',
      },
    },
    {
      $unwind: '$character',
    },
    ...((options.name || options.series || options.ids) ? [
      {
        $match: {
          'character._id': { $in: characterIds },
        },
      },
    ] : []),
    {
      $addFields: {
        baseStars: {
          $switch: {
            branches: [
              {
                case: {
                  $lte: ['$character.popularity', PopularityThreshold.FIVE_STAR],
                },
                then: CharacterStar.FIVE_STAR,
              },
              {
                case: {
                  $and: [
                    { $gt: ['$character.popularity', PopularityThreshold.FIVE_STAR] },
                    { $lte: ['$character.popularity', PopularityThreshold.FOUR_STAR] },
                  ],
                },
                then: CharacterStar.FOUR_STAR,
              },
              {
                case: {
                  $and: [
                    { $gt: ['$character.popularity', PopularityThreshold.FOUR_STAR] },
                    { $lte: ['$character.popularity', PopularityThreshold.THREE_STAR] },
                  ],
                },
                then: CharacterStar.THREE_STAR,
              },
              {
                case: {
                  $gt: ['$character.popularity', PopularityThreshold.THREE_STAR],
                },
                then: CharacterStar.TWO_STAR,
              },
            ],
            default: CharacterStar.TWO_STAR,
          },
        },
        additionalStars: {
          $switch: {
            branches: [
              { case: { $gte: ['$count', AwakeningStage.THIRD] }, then: 3 },
              { case: { $gte: ['$count', AwakeningStage.SECOND] }, then: 2 },
              { case: { $gte: ['$count', AwakeningStage.FIRST] }, then: 1 },
            ],
            default: 0,
          },
        },
      },
    },
    {
      $addFields: {
        stars: {
          $add: ['$baseStars', '$additionalStars'],
        },
      },
    },
    ...(options.stars ? [
      {
        $match: {
          stars: adjustStars(options.stars),
        },
      },
    ] : []),
    ...(options.skip ? [{ $skip: options.skip }] : []),
    ...(options.limit ? [{ $limit: options.limit }] : []),
    {
      $lookup: {
        from: 'series',
        as: 'character.series',
        localField: 'character.series',
        foreignField: '_id',
      },
    },
  ]);
};
