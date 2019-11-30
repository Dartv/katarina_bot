import { prop, indexBy } from 'ramda';

import { Series, Character } from '../..';

export async function getUserCharactersBySeries(input: string): Promise<any[]>;

export default async function getUserCharactersBySeries(input) {
  const characters = await Character.find({
    _id: { $in: this.characters },
  }).select('series name').lean();
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
  }).select('_id').lean();
  const seriesById = indexBy(prop('_id'), series);
  return characters.filter(char => char.series.some(s => seriesById[s]));
}
