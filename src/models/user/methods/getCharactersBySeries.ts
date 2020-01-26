import { prop, indexBy } from 'ramda';

import { Series, Character } from '../..';
import { ICharacter } from '../../character/types';

export interface IGetUserCharactersBySeries {
  (input: string, options?: { limit?: number; skip?: number }): Promise<ICharacter[]>;
}

const getCharactersBySeries: IGetUserCharactersBySeries = async function getUserCharactersBySeries(
  input,
  { limit = 0, skip = 0 } = {},
) {
  const characters = await Character.find({
    _id: { $in: this.characters },
  })
    .select('series name')
    .lean();
  const ids = characters.reduce((series, char) => {
    char.series.forEach((s) => {
      series.add(s);
    });
    return series;
  }, new Set());
  const series = await Series.find({
    _id: { $in: [...ids] },
    $text: {
      $search: input,
    },
  })
    .select('_id')
    .skip(skip)
    .limit(limit)
    .lean();
  const seriesById = indexBy(prop('_id'), series);
  return characters.filter(char => char.series.some(s => seriesById[s]));
};

export default getCharactersBySeries;
