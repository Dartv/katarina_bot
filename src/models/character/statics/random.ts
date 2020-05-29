import { ICharacter } from '../types';
import { Character } from '../..';

export default async function getRandomCharacters(n: number, pipeline: object[] = []): Promise<ICharacter[]> {
  const characters = await this.aggregate([
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
  return Promise.all(
    characters.map((character: ICharacter) => new Character(character).populate('series').execPopulate()),
  );
}
