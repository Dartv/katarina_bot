import R from 'ramda';

import { ICharacter } from '../types';
import { Character } from '../..';

export default async function getRandomCharacters(n: number, pipeline: object[] = []): Promise<ICharacter[]> {
  const characters: { _id: any }[] = await this.aggregate([
    ...pipeline,
    { $sample: { size: n } },
    {
      $project: {
        _id: 1,
      },
    },
  ]);
  return Character.find({ _id: R.pluck('_id', characters) }).populate('series');
}
