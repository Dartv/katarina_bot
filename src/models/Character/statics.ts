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
