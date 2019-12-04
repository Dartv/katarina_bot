import { ICharacter } from '../types';

export default async function getRandomCharacters(n: number, pipeline?: object[]): Promise<ICharacter[]> {
  return this.aggregate([
    ...pipeline,
    { $sample: { size: n } },
    {
      $lookup: {
        from: 'series',
        as: 'series',
        localField: 'series',
        foreignField: '_id',
      },
    },
  ]);
}
